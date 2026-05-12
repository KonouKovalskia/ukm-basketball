'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface MemberRef {
  full_name: string
  nim: string
}

interface Due {
  id: string
  period: string
  amount: number
  status: string
  receipt_url: string | null
  paid_at: string | null
  profiles: MemberRef | null
}

function normalizeMember(raw: MemberRef | MemberRef[] | null): MemberRef | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

function normalizeDues(data: any[]): Due[] {
  return data.map((d) => ({ ...d, profiles: normalizeMember(d.profiles) }))
}

export default function AdminPayrollPage() {
  const supabase = createClient()
  const router = useRouter()
  const [dues, setDues] = useState<Due[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'rejected'>('pending')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await fetchDues()
      setLoading(false)
    }
    load()
  }, [filter])

  async function fetchDues() {
    const { data } = await supabase
      .from('dues')
      .select('id, period, amount, status, receipt_url, paid_at, profiles(full_name, nim)')
      .eq('status', filter)
      .order('paid_at', { ascending: false })
    setDues(normalizeDues(data ?? []))
  }

  async function handleConfirm(id: string) {
    setProcessing(id)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('dues').update({ status: 'confirmed', confirmed_by: user?.id }).eq('id', id)
    await fetchDues()
    setProcessing(null)
  }

  async function handleReject(id: string) {
    setProcessing(id)
    await supabase.from('dues').update({ status: 'rejected' }).eq('id', id)
    await fetchDues()
    setProcessing(null)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-orange-500 animate-pulse">Memuat...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center gap-4">
        <a href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">← Kembali</a>
        <h1 className="font-bold">Kelola Iuran</h1>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex gap-2">
          {(['pending', 'confirmed', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}
            >
              {f === 'pending' ? 'Menunggu' : f === 'confirmed' ? 'Dikonfirmasi' : 'Ditolak'}
            </button>
          ))}
        </div>

        {dues.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Tidak ada data iuran.</div>
        ) : (
          <div className="space-y-4">
            {dues.map((due) => (
              <div key={due.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-semibold">{due.profiles?.full_name ?? 'Anggota'}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">NIM: {due.profiles?.nim ?? '-'}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                      <p className="text-sm text-gray-400">Periode: <span className="text-white">{due.period}</span></p>
                      <p className="text-sm text-gray-400">Jumlah: <span className="text-white">Rp {due.amount.toLocaleString('id-ID')}</span></p>
                      {due.paid_at && (
                        <p className="text-sm text-gray-400">
                          Tanggal: <span className="text-white">
                            {new Date(due.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </p>
                      )}
                    </div>
                    {due.receipt_url && (
                      <a href={due.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-orange-400 hover:underline">
                        Lihat Bukti Transfer →
                      </a>
                    )}
                  </div>
                  {filter === 'pending' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleConfirm(due.id)}
                        disabled={processing === due.id}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        {processing === due.id ? '...' : 'Konfirmasi'}
                      </button>
                      <button
                        onClick={() => handleReject(due.id)}
                        disabled={processing === due.id}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}