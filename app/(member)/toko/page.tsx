'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
}

interface ProductRef {
  name: string
}

interface Order {
  id: string
  quantity: number
  total: number
  status: string
  ordered_at: string
  products: ProductRef | null
}

const statusLabel: Record<string, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Dikonfirmasi',
  rejected: 'Ditolak',
}

const statusClass: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

function normalizeProductRef(raw: ProductRef | ProductRef[] | null): ProductRef | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

function normalizeOrders(data: any[]): Order[] {
  return data.map((o) => ({ ...o, products: normalizeProductRef(o.products) }))
}

export default function TokoPage() {
  const supabase = createClient()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const [{ data: productsData }, { data: ordersData }] = await Promise.all([
        supabase.from('products').select('id, name, description, price, stock, image_url').eq('is_active', true),
        supabase.from('orders').select('id, quantity, total, status, ordered_at, products(name)').eq('member_id', user.id).order('ordered_at', { ascending: false }),
      ])

      setProducts((productsData ?? []) as Product[])
      setOrders(normalizeOrders(ordersData ?? []))
      setLoading(false)
    }
    load()
  }, [])

  async function handleOrder() {
    if (!selected || !file || !userId) {
      setError('Pilih produk dan upload bukti pembayaran.')
      return
    }
    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const path = `orders/${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('order-receipts').upload(path, file)
    if (uploadError) {
      setError('Gagal upload file.')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('order-receipts').getPublicUrl(path)

    const { error: insertError } = await supabase.from('orders').insert({
      member_id: userId,
      product_id: selected.id,
      quantity,
      total: selected.price * quantity,
      status: 'pending',
      receipt_url: urlData.publicUrl,
    })

    if (insertError) {
      setError('Gagal menyimpan pesanan.')
      setUploading(false)
      return
    }

    setSuccess(`Pesanan ${selected.name} berhasil dikirim!`)
    setSelected(null)
    setQuantity(1)
    setFile(null)

    const { data } = await supabase
      .from('orders')
      .select('id, quantity, total, status, ordered_at, products(name)')
      .eq('member_id', userId)
      .order('ordered_at', { ascending: false })
    setOrders(normalizeOrders(data ?? []))
    setUploading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-orange-500 animate-pulse">Memuat...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center gap-4">
        <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">← Kembali</a>
        <h1 className="font-bold">Toko UKM</h1>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">{success}</div>
        )}

        <div>
          <h2 className="font-semibold mb-4">Produk Tersedia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => { setSelected(p); setQuantity(1); setError(''); setSuccess('') }}
                className={`bg-gray-900 border rounded-2xl p-5 cursor-pointer transition-colors ${selected?.id === p.id ? 'border-orange-500' : 'border-gray-800 hover:border-gray-600'}`}
              >
                {p.image_url && (
                  <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                )}
                <h3 className="font-semibold">{p.name}</h3>
                {p.description && <p className="text-gray-400 text-sm mt-1">{p.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-orange-500 font-bold">Rp {p.price.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-500">Stok: {p.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Pesan: {selected.name}</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Jumlah</label>
              <input
                type="number"
                min={1}
                max={selected.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-3">
              <p className="text-sm text-gray-400">Total pembayaran</p>
              <p className="text-xl font-bold text-orange-500">
                Rp {(selected.price * quantity).toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Bukti Transfer</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:text-sm cursor-pointer"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleOrder}
                disabled={uploading}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {uploading ? 'Mengirim...' : 'Kirim Pesanan'}
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="font-semibold mb-4">Riwayat Pesanan</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada pesanan.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{o.products?.name ?? 'Produk'}</p>
                    <p className="text-sm text-gray-400">{o.quantity} pcs &bull; Rp {o.total.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {new Date(o.ordered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusClass[o.status] ?? 'bg-gray-700 text-gray-300'}`}>
                    {statusLabel[o.status] ?? o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}