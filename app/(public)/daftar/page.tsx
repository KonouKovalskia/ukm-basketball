'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function DaftarPage() {
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', nim: '', email: '', phone: '', motivation: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.full_name || !form.nim || !form.email) {
      setError('Nama, NIM, dan email wajib diisi.')
      return
    }
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('registrations').insert({
      full_name: form.full_name,
      nim: form.nim,
      email: form.email,
      phone: form.phone || null,
      motivation: form.motivation || null,
      status: 'pending',
    })

    if (insertError) {
      setError('Gagal mengirim pendaftaran. Coba lagi.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">Pendaftaran Terkirim!</h1>
        <p className="text-gray-400 text-sm">
          Terima kasih, <span className="text-white">{form.full_name}</span>! Pendaftaranmu sudah kami terima dan sedang menunggu review dari admin. Kami akan menghubungi kamu via email.
        </p>
        <a href="/" className="inline-block mt-6 text-orange-500 hover:underline text-sm">← Kembali ke Beranda</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center gap-4">
        <a href="/" className="text-gray-400 hover:text-white transition-colors">← Beranda</a>
        <h1 className="font-bold">Daftar UKM Basketball</h1>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Bergabung dengan kami</h2>
          <p className="text-gray-400 text-sm mt-1">Isi form di bawah untuk mendaftar sebagai anggota UKM Basketball.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          {[
            { name: 'full_name', label: 'Nama Lengkap', placeholder: 'Nama kamu', required: true },
            { name: 'nim', label: 'NIM', placeholder: 'Nomor Induk Mahasiswa', required: true },
            { name: 'email', label: 'Email', placeholder: 'email@kampus.ac.id', required: true },
            { name: 'phone', label: 'No. HP / WhatsApp', placeholder: '08xxxxxxxxxx', required: false },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-gray-400 mb-1.5">
                {field.label} {field.required && <span className="text-orange-500">*</span>}
              </label>
              <input
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Motivasi Bergabung</label>
            <textarea
              name="motivation"
              value={form.motivation}
              onChange={handleChange}
              placeholder="Ceritakan alasan kamu ingin bergabung..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Mengirim...' : 'Kirim Pendaftaran'}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs">
          Sudah punya akun?{' '}
          <a href="/login" className="text-orange-500 hover:underline">Login di sini</a>
        </p>
      </div>
    </div>
  )
}