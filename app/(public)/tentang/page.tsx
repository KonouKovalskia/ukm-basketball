'use client'

export default function TentangPage() {
  const timeline = [
    { year: '2014', title: 'Berdiri', desc: 'UKM Basketball resmi didirikan oleh sekelompok mahasiswa pecinta basket.' },
    { year: '2016', title: 'Ekspansi Cabang', desc: 'Membuka cabang pertama di luar kampus utama.' },
    { year: '2019', title: 'Juara Regional', desc: 'Pertama kali meraih juara 1 turnamen basket regional antar kampus.' },
    { year: '2022', title: 'Portal Digital', desc: 'Meluncurkan sistem manajemen anggota digital untuk memudahkan administrasi.' },
    { year: '2026', title: 'Hari Ini', desc: 'Lebih dari 200 anggota aktif di 5 cabang dengan program latihan yang terus berkembang.' },
  ]

  const pengurus = [
    { name: 'Ahmad Rizky', position: 'Ketua UKM', nim: '2021001' },
    { name: 'Sari Dewi', position: 'Wakil Ketua', nim: '2021045' },
    { name: 'Budi Santoso', position: 'Bendahara', nim: '2021089' },
    { name: 'Rina Maharani', position: 'Sekretaris', nim: '2021112' },
    { name: 'Dimas Pratama', position: 'Pelatih Utama', nim: '2020033' },
    { name: 'Fira Azzahra', position: 'Humas', nim: '2022007' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-3">
            <span className="text-2xl">🏀</span>
            <span className="font-bold">UKM Basketball</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Masuk</a>
          <a href="/daftar" className="text-sm bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl transition-colors font-medium">Daftar</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center border-b border-gray-800">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-4">Tentang Kami</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            UKM Basketball adalah organisasi mahasiswa yang berdedikasi mengembangkan bakat basket di lingkungan kampus sejak 2014.
          </p>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h2 className="text-xl font-bold mb-3">Visi</h2>
            <p className="text-gray-400 leading-relaxed">
              Menjadi UKM Basketball terbaik di tingkat nasional yang melahirkan atlet berprestasi sekaligus individu berkarakter.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl mb-3">📋</div>
            <h2 className="text-xl font-bold mb-3">Misi</h2>
            <ul className="text-gray-400 space-y-2 text-sm">
              {[
                'Menyelenggarakan latihan rutin dan terstruktur',
                'Aktif mengikuti kompetisi di berbagai tingkat',
                'Membangun komunitas yang inklusif dan solid',
                'Mengembangkan kepemimpinan anggota',
              ].map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">→</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-16 border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Perjalanan Kami</h2>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {item.year.slice(2)}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 bg-gray-800 flex-1 my-1" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-orange-500 text-xs font-medium mb-1">{item.year}</p>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pengurus */}
      <section className="px-6 py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Pengurus Aktif</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pengurus.map((p) => (
              <div key={p.nim} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl mx-auto mb-3">
                  🏀
                </div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-orange-500 text-xs mt-1">{p.position}</p>
                <p className="text-gray-600 text-xs mt-0.5">NIM: {p.nim}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-600 text-sm">
        <p>© 2026 UKM Basketball. <a href="/" className="text-orange-500 hover:underline">Kembali ke Beranda</a></p>
      </footer>
    </div>
  )
}