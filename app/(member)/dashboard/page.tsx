'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Branch {
  name: string
  city: string
}

interface Profile {
  full_name: string
  nim: string
  role: string
  status: string
  position: string
  branches: Branch | null
}

interface Due {
  id: string
  period: string
  amount: number
  status: string
}

interface Announcement {
  id: string
  title: string
  body: string
  published_at: string
}

interface NavItem {
  href: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/jadwal',     icon: '\u{1F4C5}', label: 'Jadwal' },
  { href: '/iuran',      icon: '\u{1F4B3}', label: 'Iuran' },
  { href: '/progress',   icon: '\u{1F4C8}', label: 'Progress' },
  { href: '/toko',       icon: '\u{1F6CD}', label: 'Toko' },
  { href: '/komunikasi', icon: '\u{1F4E3}', label: 'Info' },
  { href: '/resign',     icon: '\u{1F6AA}', label: 'Resign' },
]

function dueStatusLabel(status: string): string {
  if (status === 'confirmed') return 'Lunas'
  if (status === 'rejected') return 'Ditolak'
  return 'Menunggu'
}

function dueStatusClass(status: string): string {
  if (status === 'confirmed') return 'bg-green-500/20 text-green-400'
  if (status === 'rejected') return 'bg-red-500/20 text-red-400'
  return 'bg-yellow-500/20 text-yellow-400'
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [dues, setDues] = useState<Due[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const [{ data: profileData }, { data: duesData }, { data: announcementsData }] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, nim, role, status, position, branches(name, city)')
            .eq('id', user.id)
            .single(),
          supabase
            .from('dues')
            .select('id, period, amount, status')
            .eq('member_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('announcements')
            .select('id, title, body, published_at')
            .order('published_at', { ascending: false })
            .limit(5),
        ])

      if (profileData) {
        const raw = profileData as {
          full_name: string
          nim: string
          role: string
          status: string
          position: string
          branches: Branch | Branch[] | null
        }
        setProfile({
          ...raw,
          branches: Array.isArray(raw.branches)
            ? (raw.branches[0] ?? null)
            : raw.branches,
        })
      }

      setDues(duesData ?? [])
      setAnnouncements(announcementsData ?? [])
      setLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('announcements-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          setAnnouncements((prev) => [
            payload.new as Announcement,
            ...prev.slice(0, 4),
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-orange-500 text-lg animate-pulse">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <div>
            <p className="font-bold text-white leading-none">UKM Basketball</p>
            <p className="text-gray-400 text-xs">Portal Anggota</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">
            {profile?.full_name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            Keluar
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6">
          <p className="text-orange-100 text-sm mb-1">Selamat datang kembali</p>
          <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
          <div className="flex flex-wrap gap-3 mt-3">
            {profile?.nim && (
              <span className="bg-orange-600/50 text-orange-100 text-xs px-3 py-1 rounded-full">
                NIM: {profile.nim}
              </span>
            )}
            {profile?.position && (
              <span className="bg-orange-600/50 text-orange-100 text-xs px-3 py-1 rounded-full">
                {profile.position}
              </span>
            )}
            {profile?.branches && (
              <span className="bg-orange-600/50 text-orange-100 text-xs px-3 py-1 rounded-full">
                {profile.branches.name}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="bg-gray-900 border border-gray-800 hover:border-orange-500 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors group"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                {item.label}
              </span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Status Iuran</h2>
              <a href="/iuran" className="text-orange-500 text-sm hover:underline">
                Lihat semua
              </a>
            </div>
            {dues.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada data iuran.</p>
            ) : (
              <div className="space-y-3">
                {dues.map((due) => (
                  <div key={due.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{due.period}</p>
                      <p className="text-xs text-gray-400">
                        Rp {due.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${dueStatusClass(due.status)}`}>
                      {dueStatusLabel(due.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Pengumuman</h2>
              <a href="/komunikasi" className="text-orange-500 text-sm hover:underline">
                Lihat semua
              </a>
            </div>
            {announcements.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada pengumuman.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="border-l-2 border-orange-500 pl-3">
                    <p className="text-sm font-medium leading-snug">{ann.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{ann.body}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(ann.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}