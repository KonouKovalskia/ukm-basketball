'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Stats {
  totalMembers: number
  pendingDues: number
  pendingRegistrations: number
  pendingOrders: number
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, pendingDues: 0, pendingRegistrations: 0, pendingOrders: 0 })
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'owner'].includes(profile.role)) {
        router.push('/dashboard')
        return
      }

      setAdminName(profile.full_name)

      const [
        { count: totalMembers },
        { count: pendingDues },
        { count: pendingRegistrations },
        { count: pendingOrders },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('dues').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      setStats({
        totalMembers: totalMembers ?? 0,
        pendingDues: pendingDues ?? 0,
        pendingRegistrations: pendingRegistrations ?? 0,
        pendingOrders: pendingOrders ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    { href: '/admin/registrasi', icon: '\u{1F4CB}', label: 'Registrasi', badge: stats.pendingRegistrations },
    { href: '/admin/payroll',    icon: '\u{1F4B0}', label: 'Payroll', badge: stats.pendingDues },
    { href: '/admin/kelola',     icon: '\u{2699}',  label: 'Kelola Konten', badge: 0 },
  ]

  const statCards = [
    { label: 'Total Anggota Aktif', value: stats.totalMembers, color: 'text-blue-400' },
    { label: 'Iuran Pending',       value: stats.pendingDues, color: 'text-yellow-400' },
    { label: 'Pendaftaran Baru',    value: stats.pendingRegistrations, color: 'text-orange-400' },
    { label: 'Pesanan Pending',     value: stats.pendingOrders, color: 'text-purple-400' },
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
            <p className="text-orange-500 text-xs">Panel Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">{adminName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            Keluar
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Halo, {adminName} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Ini ringkasan kondisi UKM hari ini.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-gray-400 text-sm">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="bg-gray-900 border border-gray-800 hover:border-orange-500 rounded-2xl p-6 flex items-center gap-4 transition-colors group"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-semibold group-hover:text-orange-500 transition-colors">{item.label}</p>
                {item.badge > 0 && (
                  <p className="text-xs text-yellow-400 mt-0.5">{item.badge} perlu ditangani</p>
                )}
              </div>
              <span className="text-gray-600 group-hover:text-orange-500 transition-colors">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}