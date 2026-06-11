'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardNav from '@/components/ui/DashboardNav'
import { API_URL } from '@/lib/config'
import { getCache, setCache } from '@/lib/dataCache'

interface UserData {
  id: string
  nombre: string
  apellido: string
  email: string
  total_points: number
  total_predictions: number
  is_admin: boolean
}

interface Match {
  id: string
  home_team: string
  away_team: string
  match_date: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(() => getCache<UserData>('user_me') || null)
  const [matches, setMatches] = useState<Match[]>(() => getCache<Match[]>('matches_scheduled') || [])
  const [loading, setLoading] = useState(!user)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/auth/login')
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_URL}/api/user/me`, { headers }),
      fetch(`${API_URL}/api/matches?status=scheduled`, { headers }),
    ])
      .then(async ([userRes, matchesRes]) => {
        if (userRes.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/auth/login')
          return
        }
        const userData = await userRes.json()
        const matchesData = await matchesRes.json()
        setCache('user_me', userData.user)
        setCache('matches_scheduled', (matchesData.matches || []).slice(0, 5))
        setUser(userData.user)
        setMatches((matchesData.matches || []).slice(0, 5))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  if (!user) return null

  const displayName = `${user.nombre} ${user.apellido}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <DashboardNav displayName={displayName} isAdmin={user.is_admin} />
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>Ante cualquier problema o bug, por favor comunicarse con Sebastian a sebastian.makkos2@gmail.com</p>
          <p className="mt-1">¡Muy pronto se sumará un premio para el top 3 (o el equivalente en plata)!</p>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user.nombre}!
          </h1>
          <p className="text-gray-600">Tu panel del Prode Mundial 2026</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tus Predicciones</h3>
            <p className="text-3xl font-bold text-blue-600">{user.total_predictions}</p>
            <p className="text-sm text-gray-500 mt-1">Total realizadas</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Puntos</h3>
            <p className="text-3xl font-bold text-green-600">{user.total_points}</p>
            <p className="text-sm text-gray-500 mt-1">Puntos acumulados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              <Link href="/matches" className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center">
                Ver todos los partidos
              </Link>
              <Link href="/predictions" className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center">
                Mis predicciones
              </Link>
              <Link href="/ranking" className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center">
                Ver Ranking
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximos Partidos</h2>
            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{match.home_team} vs {match.away_team}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(match.match_date).toLocaleDateString('es-AR')}{' '}
                        {new Date(match.match_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay partidos próximos.</p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">Creado por Juan Sebastian Makkos · Sin fines de lucro</p>
      </div>
    </div>
  )
}
