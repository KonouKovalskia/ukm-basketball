'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Registration {
  id: string
  full_name: string
  nim: string
  email: string
  phone: string | null
  motivation: string | null
  status: string
  applied_at: string
}

export default function AdminRegistrasiPage() {
  const supabase = createClient()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await fetchRegistrations()
      setLoading(false)
    }
    load()
  }, [filter])

  async function fetchRegistrations() {
    const { data } = await supabase
      .from('registrations')
      .select('id, full_name, nim, email, phone, motivation, status, applied_at')
      .eq('status', filter)
      .order('applied_at', { ascending: false })
    setRegistrations((data ?? []) as Registration[])
  }

  async function sendStatusEmail(email: string, name: string, status: 'approved' | 'rejected') {
    // Calls a Supabase Edge Function — see /supabase/functions/notify-registration/index.ts
    await supabase.functions.invoke('notify-registration', {
      body: { email, name, status },
    })
  }

  async function handleApprove(reg: Registration) {
    setProcessing(reg.id)

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: reg.email,
      email_confirm: true,
      user_metadata: { full_name: reg.full_name, role: 'member' },
    })

    if (authError || !authData.user) {
      alert('Gagal membuat akun: ' + authError?.message)
      setProcessing(null)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('registrations').update({
      status: 'approved',
      reviewed_by: user?.id,
    }).eq('id', reg.id)

    await sendStatusEmail(reg.email, reg.full_name, 'approved')
    await fetchRegistrations()
    setProcessing(null)
  }

  async function handleReject(reg: Registration) {
    setProcessing(reg.id)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('registrations').update({ status: 'rejected', reviewed_by: user?.id }).eq('id', reg.id)
    await sendStatusEmail(reg.email, reg.full_name, 'rejected')
    await fetchRegistrations()
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
        <h1 className="font-bold">Kelola Pendaftaran</h1>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}
            >
              {f === 'pending' ? 'Menunggu' : f === 'approved' ? 'Disetujui' : 'Ditolak'}
            </button>
          ))}
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Tidak ada pendaftaran.</div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div key={reg.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                {/* Header row: name + action buttons */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="font-semibold text-lg">{reg.full_name}</h2>
                  {filter === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(reg)}
                        disabled={processing === reg.id}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        {processing === reg.id ? '...' : 'Setujui'}
                      </button>
                      <button
                        onClick={() => handleReject(reg)}
                        disabled={processing === reg.id}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>

                {/* Details grid — full width, no overlap risk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  <p className="text-sm text-gray-400">NIM: <span className="text-white">{reg.nim}</span></p>
                  <p className="text-sm text-gray-400">Email: <span className="text-white break-all">{reg.email}</span></p>
                  {reg.phone && <p className="text-sm text-gray-400">HP: <span className="text-white">{reg.phone}</span></p>}
                  <p className="text-sm text-gray-400">
                    Daftar: <span className="text-white">
                      {new Date(reg.applied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </p>
                </div>

                {reg.motivation && (
                  <div className="mt-3 bg-gray-800 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Motivasi</p>
                    <p className="text-sm text-gray-300">{reg.motivation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
