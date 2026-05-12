'use client'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <span className="font-bold">UKM Basketball</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <a href="/tentang" className="hover:text-white transition-colors">Tentang</a>
          <a href="/cabang" className="hover:text-white transition-colors">Cabang</a>
          <a href="/galeri" className="hover:text-white transition-colors">Galeri</a>
          <a href="/kontak" className="hover:text-white transition-colors">Kontak</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Masuk</a>
          <a href="/daftar" className="text-sm bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl transition-colors font-medium">Daftar</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
            Unit Kegiatan Mahasiswa
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
            Satu Tim,<br />
            <span className="text-orange-500">Satu Tujuan.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            UKM Basketball adalah rumah bagi mahasiswa yang mencintai basket. Latihan rutin, kompetisi, dan komunitas yang solid menanti kamu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/daftar" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-lg">
              Bergabung Sekarang
            </a>
            <a href="/tentang" className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-lg">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '200+', label: 'Anggota Aktif' },
            { value: '5', label: 'Cabang' },
            { value: '10+', label: 'Tahun Berdiri' },
            { value: '50+', label: 'Kejuaraan' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-orange-500">{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Kenapa UKM Basketball?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '\u{1F3AF}', title: 'Latihan Terstruktur', desc: 'Program latihan mingguan dengan pelatih berpengalaman untuk meningkatkan skill kamu secara konsisten.' },
              { icon: '\u{1F3C6}', title: 'Kompetisi Rutin', desc: 'Ikut turnamen antar kampus dan kompetisi nasional. Buktikan kemampuan kamu di lapangan.' },
              { icon: '\u{1F91D}', title: 'Komunitas Solid', desc: 'Lebih dari sekadar basket — kita adalah keluarga. Network yang kuat untuk perjalanan karirmu.' },
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap bergabung?</h2>
          <p className="text-orange-100 mb-8">Pendaftaran dibuka setiap semester. Jangan sampai ketinggalan.</p>
          <a href="/daftar" className="inline-block bg-white text-orange-500 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors">
            Daftar Sekarang
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-600 text-sm">
        <p>© 2026 UKM Basketball. Dibuat dengan ❤️ untuk mahasiswa Indonesia.</p>
      </footer>
    </div>
  )
}