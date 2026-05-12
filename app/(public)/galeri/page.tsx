'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface GalleryItem {
  id: string
  title: string | null
  image_url: string
  created_at: string
}

export default function GaleriPage() {
  const supabase = createClient()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<GalleryItem | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('gallery')
        .select('id, title, image_url, created_at')
        .order('created_at', { ascending: false })
      setItems((data ?? []) as GalleryItem[])
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
          <h1 className="text-4xl font-extrabold mb-4">Galeri</h1>
          <p className="text-gray-400 text-lg">Momen-momen terbaik UKM Basketball.</p>
        </div>
      </section>

      <section className="px-6 py-16 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-16 text-orange-500 animate-pulse">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Belum ada foto di galeri.</div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-2xl bg-gray-900"
              >
                <img
                  src={item.image_url}
                  alt={item.title ?? 'Galeri'}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-sm font-medium">{item.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.image_url}
              alt={selected.title ?? 'Galeri'}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            {selected.title && (
              <p className="text-center text-gray-300 mt-4">{selected.title}</p>
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-4 mx-auto block text-gray-400 hover:text-white transition-colors text-sm"
            >
              Tutup ✕
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-600 text-sm">
        <p>© 2026 UKM Basketball. <a href="/" className="text-orange-500 hover:underline">Kembali ke Beranda</a></p>
      </footer>
    </div>
  )
}