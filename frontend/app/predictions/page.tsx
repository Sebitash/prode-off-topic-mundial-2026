'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/ui/DashboardNav'
import ResultsTabs from '@/components/matches/ResultsTabs'
import { API_URL } from '@/lib/config'
import { getCache, setCache } from '@/lib/dataCache'

interface Match {
  id: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  match_date: string
  stage: string
  status: 'scheduled' | 'live' | 'finished'
}

export default function PredictionsPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>(() => getCache<Match[]>('matches') || [])
  const [displayName, setDisplayName] = useState('')
  const [userId, setUserId] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(matches.length === 0)
  const [highlightMatchId, setHighlightMatchId] = useState<string | null>(null)
  const [highlightNonce, setHighlightNonce] = useState(0)

  useEffect(() => {
    setHighlightMatchId(new URLSearchParams(window.location.search).get('match'))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token) {
      router.replace('/auth/login')
      return
    }

    if (storedUser) {
      const u = JSON.parse(storedUser)
      setDisplayName(`${u.nombre} ${u.apellido}`)
      setUserId(u.id)
      setIsAdmin(!!u.is_admin)
    }

    // Todos los partidos: fase de grupos y fase eliminatoria
    fetch(`${API_URL}/api/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('token')
          router.replace('/auth/login')
          return
        }
        const data = await res.json()
        setCache('matches', data.matches || [])
        setMatches(data.matches || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  if (loading && matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Cargando predicciones...</p>
      </div>
    )
  }

  const nextOpenMatch = matches.find(
    (m) => m.status === 'scheduled' && new Date(m.match_date).getTime() - Date.now() > 60 * 60 * 1000
  )

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardNav displayName={displayName} isAdmin={isAdmin} />
      <div className="relative overflow-hidden">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        {nextOpenMatch && (
          <button
            type="button"
            onClick={() => {
              setHighlightMatchId(nextOpenMatch.id)
              setHighlightNonce((n) => n + 1)
            }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-700 active:scale-95"
          >
            ⚽ Ir al próximo partido →
          </button>
        )}
        <ResultsTabs
          matches={matches}
          userId={userId}
          showSecondaryTabs={false}
          title="Tus Predicciones"
          description="Completá tus pronósticos para la fase de grupos y la fase eliminatoria. Las predicciones cierran 1 hora antes del inicio de cada partido. Los cruces de eliminatorias 'Por definir' se habilitan cuando se conocen los equipos."
          highlightMatchId={highlightMatchId}
          highlightNonce={highlightNonce}
        />
        <p className="mt-8 text-center text-xs text-gray-400 dark:text-slate-500">Creado por Juan Sebastian Makkos · Sin fines de lucro</p>
      </div>
      </div>
    </div>
  )
}
