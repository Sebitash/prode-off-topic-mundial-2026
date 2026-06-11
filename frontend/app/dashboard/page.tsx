'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardNav from '@/components/ui/DashboardNav'
import { FLAG_CODES, TEAM_TO_CODE } from '@/components/matches/ResultsTabs'
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

function useCountdown(targetDate: string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const diff = new Date(targetDate).getTime() - now
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[56px] flex-col items-center rounded-lg bg-white/10 px-3 py-2">
      <span className="text-2xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
      <span className="text-[10px] uppercase tracking-wide text-sky-100">{label}</span>
    </div>
  )
}

function NextMatchCountdown({ match }: { match: Match }) {
  const countdown = useCountdown(match.match_date)

  if (!countdown) return null

  return (
    <div className="flex flex-col items-center rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-900 dark:to-slate-800 p-6 text-center text-white shadow-md">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-100">⏱ Próximo partido</p>
      <p className="mb-3 flex items-center gap-2 text-lg font-bold">
        <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.home_team] || 'xx'] || 'xx'} w-6 h-6 rounded`}></span>
        {match.home_team} vs {match.away_team}
        <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.away_team] || 'xx'] || 'xx'} w-6 h-6 rounded`}></span>
      </p>
      <div className="flex gap-3">
        <CountdownUnit value={countdown.days} label="Días" />
        <CountdownUnit value={countdown.hours} label="Hs" />
        <CountdownUnit value={countdown.minutes} label="Min" />
        <CountdownUnit value={countdown.seconds} label="Seg" />
      </div>
      <p className="mt-3 text-xs text-sky-100">
        {new Date(match.match_date).toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })} hs (ARG) · Las predicciones cierran 1 hora antes
      </p>
    </div>
  )
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
      </div>
    )
  }

  if (!user) return null

  const displayName = `${user.nombre} ${user.apellido}`

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardNav displayName={displayName} isAdmin={user.is_admin} />
      <div className="relative overflow-hidden">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 px-4 py-3 text-sm text-sky-800 dark:text-sky-400">
          <p>
            <span className="font-semibold">Novedad:</span> ahora podés cambiar entre tema claro ☀️ y oscuro 🌙 con el botón al lado de "Logout", arriba a la derecha.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
          <p>Ante cualquier problema o bug, por favor comunicarse con Sebastian a sebastian.makkos2@gmail.com</p>
          <p className="mt-1">¡Muy pronto se sumará un premio para el top 3 (o el equivalente en plata)!</p>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            ¡Bienvenido, {user.nombre}!
          </h1>
          <p className="text-gray-600 dark:text-slate-400">Tu panel del Prode Mundial 2026</p>
        </div>

        {matches.length > 0 && <NextMatchCountdown match={matches[0]} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Tus Predicciones</h3>
            <p className="text-3xl font-bold text-blue-600">{user.total_predictions}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Total realizadas</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Total de Puntos</h3>
            <p className="text-3xl font-bold text-green-600">{user.total_points}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Puntos acumulados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Acciones Rápidas</h2>
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

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Próximos Partidos</h2>
            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-slate-100">{match.home_team} vs {match.away_team}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {new Date(match.match_date).toLocaleDateString('es-AR')}{' '}
                        {new Date(match.match_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-slate-400">No hay partidos próximos.</p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500">Creado por Juan Sebastian Makkos · Sin fines de lucro</p>
      </div>
      </div>
    </div>
  )
}
