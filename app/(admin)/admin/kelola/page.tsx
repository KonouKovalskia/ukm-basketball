'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Announcement {
  id: string
  title: string
  body: string
  audience: string
  published_at: string
}

interface Schedule {
  id: string
  title: string
  event_at: string
  location: string
  type: string
}

export default function AdminKelolaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [tab, setTab] = useState<'announcements' | 'schedules'>('announcements')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const [annTitle, setAnnTitle] = useState('')
  const [annBody, setAnnBody] = useState('')
  const [annAudience, setAnnAudience] = useState('all')

  const [schTitle, setSchTitle] = useState('')
  const [schDate, setSchDate] = useState('')
  const [schLocation, setSchLocation] = useState('')
  const [schMapUrl, setSchMapUrl] = useState('')
  const [schType, setSchType] = useState('latihan')

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const [{ data: annData }, { data: schData }] = await Promise.all([
        supabase.from('announcements').select('id, title, body, audience, published_at').order('published_at', { ascending: false }).limit(20),
        supabase.from('schedules').select('id, title, event_at, location, type').order('event_at', { ascending: false }).limit(20),
      ])
      setAnnouncements((annData ?? []) as Announcement[])
      setSchedules((schData ?? []) as Schedule[])
      setLoading(false)
    }
    load()
  }, [])

  async function handlePostAnnouncement() {
    if (!annTitle || !annBody) return
    setSaving(true)
    await supabase.from('announcements').insert({ title: annTitle, body: annBody, audience: annAudience, author_id: userId })
    const { data } = await supabase.from('announcements').select('id, title, body, audience, published_at').order('published_at', { ascending: false }).limit(20)
    setAnnouncements((data ?? []) as Announcement[])
    setAnnTitle(''); setAnnBody('')
    setSuccess('Pengumuman berhasil diposting!')
    setSaving(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDeleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  async function handlePostSchedule() {
    if (!schTitle || !schDate) return
    setSaving(true)
    await supabase.from('schedules').insert({ title: schTitle, event_at: schDate, location: schLocation, map_url: schMapUrl, type: schType })
    const { data } = await supabase.from('schedules').select('id, title, event_at, location, type').order('event_at', { ascending: false }).limit(20)
    setSchedules((data ?? []) as Schedule[])
    setSchTitle(''); setSchDate(''); setSchLocation(''); setSchMapUrl('')
    setSuccess('Jadwal berhasil ditambahkan!')
    setSaving(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDeleteSchedule(id: string) {
    await supabase.from('schedules').delete().eq('id', id)
    setSchedules((prev) => prev.filter((s) => s.id !== id))
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
        <h1 className="font-bold">Kelola Konten</h1>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">{success}</div>
        )}

        <div className="flex gap-2">
          {(['announcements', 'schedules'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-orange-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}>
              {t === 'announcements' ? 'Pengumuman' : 'Jadwal'}
            </button>
          ))}
        </div>

        {tab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Buat Pengumuman</h2>
              <input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Judul pengumuman"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" />
              <textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} placeholder="Isi pengumuman..." rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
              <select value={annAudience} onChange={(e) => setAnnAudience(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                <option value="all">Semua</option>
                <option value="member">Anggota saja</option>
                <option value="admin">Admin saja</option>
              </select>
              <button onClick={handlePostAnnouncement} disabled={saving || !annTitle || !annBody}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {saving ? 'Menyimpan...' : 'Posting'}
              </button>
            </div>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{ann.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{ann.body}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-400 hover:text-red-300 text-sm shrink-0 transition-colors">Hapus</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'schedules' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Tambah Jadwal</h2>
              <input value={schTitle} onChange={(e) => setSchTitle(e.target.value)} placeholder="Nama kegiatan"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" />
              <input type="datetime-local" value={schDate} onChange={(e) => setSchDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
              <input value={schLocation} onChange={(e) => setSchLocation(e.target.value)} placeholder="Lokasi (opsional)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" />
              <input value={schMapUrl} onChange={(e) => setSchMapUrl(e.target.value)} placeholder="Link Google Maps (opsional)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" />
              <select value={schType} onChange={(e) => setSchType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                <option value="latihan">Latihan</option>
                <option value="pertandingan">Pertandingan</option>
                <option value="rapat">Rapat</option>
              </select>
              <button onClick={handlePostSchedule} disabled={saving || !schTitle || !schDate}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {saving ? 'Menyimpan...' : 'Tambahkan'}
              </button>
            </div>
            <div className="space-y-3">
              {schedules.map((s) => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {new Date(s.event_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {s.location && <p className="text-xs text-gray-500 mt-0.5">{s.location}</p>}
                  </div>
                  <button onClick={() => handleDeleteSchedule(s.id)} className="text-red-400 hover:text-red-300 text-sm shrink-0 transition-colors">Hapus</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}