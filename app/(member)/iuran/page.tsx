'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Due {
  id: string
  period: string
  amount: number
  status: string
  receipt_url: string | null
  paid_at: string | null
  created_at: string
}

const statusLabel: Record<string, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Lunas',
  rejected: 'Ditolak',
}

const statusClass: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

export default function IuranPage() {
  const supabase = createClient()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [dues, setDues] = useState<Due[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod] = useState('')
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('dues')
        .select('id, period, amount, status, receipt_url, paid_at, created_at')
        .eq('member_id', user.id)
        .order('created_at', { ascending: false })

      setDues((data ?? []) as Due[])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!period || !amount || !file || !userId) {
      setError('Lengkapi semua field dan upload bukti transfer.')
      return
    }
    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const path = `receipts/${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('dues-receipts')
      .upload(path, file)

    if (uploadError) {
      setError('Gagal upload file. Pastikan ukuran file kurang dari 5MB.')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('dues-receipts')
      .getPublicUrl(path)

    const { error: insertError } = await supabase.from('dues').insert({
      member_id: userId,
      period,
      amount: parseInt(amount),
      status: 'pending',
      receipt_url: urlData.publicUrl,
      paid_at: new Date().toISOString(),
    })

    if (insertError) {
      setError('Gagal menyimpan data. Coba lagi.')
      setUploading(false)
      return
    }

    setSuccess('Pembayaran berhasil dikirim! Menunggu konfirmasi admin.')
    setShowForm(false)
    setPeriod('')
    setAmount('')
    setFile(null)

    const { data } = await supabase
      .from('dues')
      .select('id, period, amount, status, receipt_url, paid_at, created_at')
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
    setDues((data ?? []) as Due[])
    setUploading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-orange-500 animate-pulse">Memuat...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center gap-4">
        <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">← Kembali</a>
        <h1 className="font-bold">Iuran Anggota</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-2">Info Pembayaran</h2>
          <p className="text-gray-400 text-sm mb-4">Transfer ke rekening berikut, lalu upload bukti di bawah.</p>
          <div className="space-y-2">
            {[
              { bank: 'BRI', number: '1234-5678-9012-3456', name: 'UKM Basketball Universitas' },
              { bank: 'BNI', number: '0987-6543-2101-0000', name: 'UKM Basketball Universitas' },
            ].map((acc) => (
              <div key={acc.bank} className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{acc.bank}</p>
                  <p className="font-mono font-medium">{acc.number}</p>
                  <p className="text-xs text-gray-400">{acc.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          + Upload Bukti Pembayaran
        </button>

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Form Pembayaran</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Periode (contoh: Mei 2026)</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Mei 2026"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Jumlah Transfer (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Bukti Transfer</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:text-sm cursor-pointer"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {uploading ? 'Mengirim...' : 'Kirim Bukti'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="font-semibold">Riwayat Iuran</h2>
          {dues.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada riwayat iuran.</p>
          ) : dues.map((due) => (
            <div key={due.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{due.period}</p>
                <p className="text-sm text-gray-400">Rp {due.amount.toLocaleString('id-ID')}</p>
                {due.paid_at && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(due.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {due.receipt_url && (
                  <a
                    href={due.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-400 hover:underline"
                  >
                    Lihat bukti
                  </a>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusClass[due.status] ?? 'bg-gray-700 text-gray-300'}`}>
                  {statusLabel[due.status] ?? due.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}