'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResignPage() {
  const supabase = createClient()
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleResign() {
    if (!confirmed || !reason.trim()) {
      setError('Isi alasan dan centang konfirmasi terlebih dahulu.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: 'resigned' })
      .eq('id', user.id)

    if (updateError) {
      setError('Gagal memproses resign. Coba lagi.')
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/?resigned=true')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center gap-4">
        <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">← Kembali</a>
        <h1 className="font-bold">Resign dari UKM</h1>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12 space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-red-400 font-bold text-xl mb-2">Perhatian</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Setelah resign, akun kamu akan dinonaktifkan dan kamu tidak bisa mengakses portal anggota lagi.
            Keputusan ini tidak bisa dibatalkan secara langsung — kamu harus mendaftar ulang.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Alasan Resign</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tuliskan alasanmu resign dari UKM Basketball..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 accent-red-500"
            />
            <span className="text-sm text-gray-300">
              Saya memahami bahwa keputusan ini akan menonaktifkan akun saya dan saya tidak bisa mengakses portal anggota lagi.
            </span>
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleResign}
            disabled={loading || !confirmed || !reason.trim()}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Memproses...' : 'Ya, Saya Ingin Resign'}
          </button>
        </div>
      </div>
    </div>
  )
}