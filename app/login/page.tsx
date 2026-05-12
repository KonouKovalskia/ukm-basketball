'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOTP() {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (error) {
      setError('Email tidak terdaftar atau terjadi kesalahan.')
    } else {
      setStep('otp')
    }

    setLoading(false)
  }

  async function handleVerifyOTP() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setError('Kode OTP salah atau sudah kadaluarsa.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user!.id)
      .single()

    const role = profile?.role

    if (role === 'owner') router.push('/owner/dashboard')
    else if (role === 'admin') router.push('/admin/dashboard')
    else router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 mb-4">
            <span className="text-2xl">🏀</span>
          </div>
          <h1 className="text-white text-2xl font-bold">UKM Basketball</h1>
          <p className="text-gray-400 text-sm mt-1">Portal Anggota</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {step === 'email' ? (
            <>
              <h2 className="text-white font-semibold text-lg mb-1">Masuk ke akun</h2>
              <p className="text-gray-400 text-sm mb-6">
                Masukkan email terdaftar, kami akan kirim kode OTP.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    placeholder="nama@email.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleSendOTP}
                  disabled={loading || !email}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('email'); setError('') }}
                className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
              >
                ← Ganti email
              </button>
              <h2 className="text-white font-semibold text-lg mb-1">Cek email kamu</h2>
              <p className="text-gray-400 text-sm mb-6">
                Kode 6 digit dikirim ke{' '}
                <span className="text-white">{email}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Kode OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                    placeholder="123456"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Memverifikasi...' : 'Masuk'}
                </button>
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Kirim ulang kode
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Belum punya akun?{' '}
          <a href="/daftar" className="text-orange-500 hover:underline">
            Halaman pendaftaran
          </a>
        </p>
      </div>
    </main>
  )
}