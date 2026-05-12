'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Stats {
  totalMembers: number
  activeMembers: number
  resignedMembers: number
  totalRevenue: number
  pendingRevenue: number
  totalOrders: number
  totalBranches: number
}

export default function OwnerDashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0, activeMembers: 0, resignedMembers: 0,
    totalRevenue: 0, pendingRevenue: 0, totalOrders: 0, totalBranches: 0,
  })
  const [loading, setLoading] = useState(true)
  const [ownerName, setOwnerName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
      if (!profile || profile.role !== 'owner') { router.push('/dashboard'); return }
      setOwnerName(profile.full_name)

      const [
        { count: totalMembers },
        { count: activeMembers },
        { count: resignedMembers },
        { data: confirmedDues },
        { data: pendingDues },
        { count: totalOrders },
        { count: totalBranches },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'resigned'),
        supabase.from('dues').select('amount').eq('status', 'confirmed'),
        supabase.from('dues').select('amount').eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('branches').select('*', { count: 'exact', head: true }),
      ])

      const totalRevenue = (confirmedDues ?? []).reduce((sum, d) => sum + (d.amount ?? 0), 0)
      const pendingRevenue = (pendingDues ?? []).reduce((sum, d) => sum + (d.amount ?? 0), 0)

      setStats({
        totalMembers: totalMembers ?? 0,
        activeMembers: activeMembers ?? 0,
        resignedMembers: resignedMembers ?? 0,
        totalRevenue,
        pendingRevenue,
        totalOrders: totalOrders ?? 0,
        totalBranches: totalBranches ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const statCards = [
    { label: 'Total Anggota', value: stats.totalMembers, sub: `${stats.activeMembers} aktif, ${stats.resignedMembers} resign`, color: 'text-blue-400' },
    { label: 'Total Cabang', value: stats.totalBranches, sub: 'cabang terdaftar', color: 'text-purple-400' },
    { label: 'Total Pesanan', value: stats.totalOrders, sub: 'semua pesanan', color: 'text-orange-400' },
    { label: 'Iuran Terkumpul', value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, sub: `+ Rp ${stats.pendingRevenue.toLocaleString('id-ID')} pending`, color: 'text-green-400', wide: true },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-orange-500 animate-pulse">Memuat...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <div>
            <p className="font-bold leading-none">UKM Basketball</p>
            <p className="text-purple-400 text-xs">Owner Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">{ownerName}</span>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors">
            Keluar
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Overview UKM</h1>
          <p className="text-gray-400 text-sm mt-1">Ringkasan keseluruhan kondisi UKM Basketball.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 ${card.wide ? 'col-span-2' : ''}`}>
              <p className="text-gray-400 text-sm">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-600 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: '/admin/dashboard', label: 'Panel Admin', desc: 'Kelola pendaftaran, iuran, konten' },
              { href: '/admin/registrasi', label: 'Pendaftaran', desc: 'Review anggota baru' },
              { href: '/admin/payroll', label: 'Payroll / Iuran', desc: 'Konfirmasi pembayaran' },
              { href: '/admin/kelola', label: 'Kelola Konten', desc: 'Pengumuman dan jadwal' },
            ].map((item) => (
              <a key={item.href} href={item.href}
                className="bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 flex items-center justify-between transition-colors group">
                <div>
                  <p className="font-medium group-hover:text-orange-500 transition-colors">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <span className="text-gray-600 group-hover:text-orange-500 transition-colors">→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}