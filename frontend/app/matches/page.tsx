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

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>(() => getCache<Match[]>('matches') || [])
  const [displayName, setDisplayName] = useState('')
  const [userId, setUserId] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(matches.length === 0)

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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <p className="text-slate-500">Cargando partidos...</p>
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
          allowPredict={false}
        />
      </div>
    </div>
  )
}
