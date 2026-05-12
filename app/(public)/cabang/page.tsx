'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Branch {
  id: string
  name: string
  city: string
  address: string | null
  map_url: string | null
}

export default function CabangPage() {
  const supabase = createClient()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('branches')
        .select('id, name, city, address, map_url')
        .order('created_at', { ascending: true })
      setBranches((data ?? []) as Branch[])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <span className="font-bold">UKM Basketball</span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Masuk</a>
          <a href="/daftar" className="text-sm bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl transition-colors font-medium">Daftar</a>
        </div>
      </nav>

      <section className="px-6 py-20 text-center border-b border-gray-800">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-4">Cabang Kami</h1>
          <p className="text-gray-400 text-lg">Temukan cabang UKM Basketball terdekat dari kampusmu.</p>
        </div>
      </section>

      <section className="px-6 py-16 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-16 text-orange-500 animate-pulse">Memuat...</div>
        ) : branches.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Belum ada data cabang.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {branches.map((b, i) => (
              <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h2 className="font-bold">{b.name}</h2>
                    <p className="text-orange-500 text-xs">{b.city}</p>
                  </div>
                </div>
                {b.address && (
                  <p className="text-gray-400 text-sm mb-4 flex items-start gap-2">
                    <span className="mt-0.5">📍</span>
                    {b.address}
                  </p>
                )}
                {b.map_url && (
                  <a
                    href={b.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm px-4 py-2 rounded-xl transition-colors"
                  >
                    Lihat di Maps →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-600 text-sm">
        <p>© 2026 UKM Basketball. <a href="/" className="text-orange-500 hover:underline">Kembali ke Beranda</a></p>
      </footer>
    </div>
  )
}