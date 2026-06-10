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
  const [isAdmin, setIsAdmin] = useState(false)
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
        setMatches(data.matches || [])
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
      <DashboardNav displayName={displayName} isAdmin={isAdmin} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ResultsTabs
          matches={matches}
          userId={userId}
          showSecondaryTabs={false}
          title="Tus Predicciones"
          description="Completá tus pronósticos para la fase de grupos y la fase eliminatoria. Las predicciones cierran 1 hora antes del inicio de cada partido. Los cruces de eliminatorias 'Por definir' se habilitan cuando se conocen los equipos."
        />
      </div>
    </div>
  )
}
