'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Profile {
  full_name: string
}

interface Announcement {
  id: string
  title: string
  body: string
  audience: string
  published_at: string
  profiles: Profile | null
}

function normalizeProfile(raw: Profile | Profile[] | null): Profile | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

const audienceLabel: Record<string, string> = { all: 'Semua', member: 'Anggota', admin: 'Admin' }
const audienceClass: Record<string, string> = {
  all: 'bg-blue-500/20 text-blue-400',
  member: 'bg-orange-500/20 text-orange-400',
  admin: 'bg-purple-500/20 text-purple-400',
}

export default function KomunikasiPage() {
  const supabase = createClient()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  function normalizeList(data: any[]): Announcement[] {
    return data.map((a) => ({ ...a, profiles: normalizeProfile(a.profiles) }))
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('announcements')
        .select('id, title, body, audience, published_at, profiles(full_name)')
        .order('published_at', { ascending: false })

      setAnnouncements(normalizeList(data ?? []))
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('announcements-komunikasi')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          setAnnouncements((prev) => [payload.new as Announcement, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
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
        <h1 className="font-bold">Pengumuman</h1>
        <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
          Live
        </span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Belum ada pengumuman.</div>
        ) : announcements.map((ann) => (
          <div key={ann.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${audienceClass[ann.audience] ?? 'bg-gray-700 text-gray-300'}`}>
                {audienceLabel[ann.audience] ?? ann.audience}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h2 className="font-semibold text-lg mb-2">{ann.title}</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{ann.body}</p>
            {ann.profiles && (
              <p className="text-xs text-gray-600 mt-3">Oleh: {ann.profiles.full_name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
