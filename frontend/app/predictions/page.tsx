'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/ui/DashboardNav'
import ResultsTabs from '@/components/matches/ResultsTabs'
import { API_URL } from '@/lib/config'

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
  const [matches, setMatches] = useState<Match[]>([])
  const [displayName, setDisplayName] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

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
    }

    // Todos los partidos de fase de grupos
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
        const groupMatches = (data.matches || []).filter((match: Match) => {
          const stage = `${match.stage || ''}`.toLowerCase()
          const isGroup = stage.includes('group') || stage.includes('grupo')
          return isGroup
        })
        setMatches(groupMatches)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <p className="text-slate-500">Cargando predicciones...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <DashboardNav displayName={displayName} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ResultsTabs
          matches={matches}
          userId={userId}
          showSecondaryTabs={false}
          title="Tus Predicciones"
          description="Completá los partidos de la fase de grupos y guardá tus pronósticos"
        />
      </div>
    </div>
  )
}
