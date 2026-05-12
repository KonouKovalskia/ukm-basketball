'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Schedule {
  id: string
  title: string
  event_at: string
  location: string
  map_url: string
  type: string
  branches: { name: string; city: string } | null
}

const typeLabel: Record<string, string> = {
  latihan: 'Latihan',
  pertandingan: 'Pertandingan',
  rapat: 'Rapat',
}

const typeClass: Record<string, string> = {
  latihan: 'bg-blue-500/20 text-blue-400',
  pertandingan: 'bg-orange-500/20 text-orange-400',
  rapat: 'bg-purple-500/20 text-purple-400',
}

export default function JadwalPage() {
  const supabase = createClient()
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('schedules')
        .select('id, title, event_at, location, map_url, type, branches(name, city)')
        .order('event_at', { ascending: true })

      setSchedules((data ?? []) as Schedule[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-orange-500 animate-pulse">Memuat...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center gap-4">
        <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">← Kembali</a>
        <h1 className="font-bold">Jadwal Kegiatan</h1>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Belum ada jadwal.</div>
        ) : schedules.map((s) => (
          <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeClass[s.type] ?? 'bg-gray-700 text-gray-300'}`}>
                    {typeLabel[s.type] ?? s.type}
                  </span>
                  {s.branches && (
                    <span className="text-xs text-gray-500">{s.branches.name}</span>
                  )}
                </div>
                <h2 className="font-semibold text-lg">{s.title}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(s.event_at).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                  {' \u2022 '}
                  {new Date(s.event_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
                {s.location && (
                  <p className="text-gray-400 text-sm mt-1">📍 {s.location}</p>
                )}
              </div>
              {s.map_url && (
                <a
                  href={s.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs px-3 py-2 rounded-xl transition-colors"
                >
                  Lihat Peta
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}