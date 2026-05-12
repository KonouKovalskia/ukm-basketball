'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface ProgressEntry {
  id: string
  skill: string
  score: number
  note: string | null
  recorded_at: string
}

export default function ProgressPage() {
  const supabase = createClient()
  const router = useRouter()
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('progress')
        .select('id, skill, score, note, recorded_at')
        .eq('member_id', user.id)
        .order('recorded_at', { ascending: false })

      setEntries((data ?? []) as ProgressEntry[])
      setLoading(false)
    }
    load()
  }, [])

  const grouped = entries.reduce<Record<string, ProgressEntry[]>>((acc, e) => {
    acc[e.skill] = acc[e.skill] ?? []
    acc[e.skill].push(e)
    return acc
  }, {})

  const latestPerSkill = Object.entries(grouped).map(([skill, records]) => ({
    skill,
    latest: records[0],
    history: records,
  }))

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-orange-500 animate-pulse">Memuat...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center gap-4">
        <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">← Kembali</a>
        <h1 className="font-bold">Progress Skill</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {latestPerSkill.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>Belum ada data progress.</p>
            <p className="text-sm mt-1">Admin atau pelatih akan mengisi data ini.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {latestPerSkill.map(({ skill, latest }) => (
                <div key={skill} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm mb-2">{skill}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-orange-500">{latest.score}</span>
                    <span className="text-gray-500 text-sm mb-1">/10</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${latest.score * 10}%` }}
                    />
                  </div>
                  {latest.note && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{latest.note}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Riwayat Penilaian</h2>
              <div className="space-y-3">
                {entries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{e.skill}</p>
                      {e.note && <p className="text-xs text-gray-500 mt-0.5">{e.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-orange-500 font-bold">{e.score}/10</p>
                      <p className="text-xs text-gray-600">
                        {new Date(e.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}