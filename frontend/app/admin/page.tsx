'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/ui/DashboardNav'
import { API_URL } from '@/lib/config'
import {
  FLAG_CODES,
  TEAM_TO_CODE,
  TEAM_TO_GROUP,
  isGroupStage,
  formatDate,
  type Match,
} from '@/components/matches/ResultsTabs'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function AdminMatchRow({
  match,
  onSaved,
}: {
  match: Match
  onSaved: (updated: Match) => void
}) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0)
  const [homePenalties, setHomePenalties] = useState<number | ''>(match.home_penalties ?? '')
  const [awayPenalties, setAwayPenalties] = useState<number | ''>(match.away_penalties ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const hasResult = match.home_score !== null && match.away_score !== null
  const isDraw = homeScore === awayScore
  const showPenalties = isDraw && !isGroupStage(match.stage)

  const updateResult = async (
    homeValue: number | null,
    awayValue: number | null,
    penalties?: { home: number; away: number } | null
  ) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/matches/${match.id}/result`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          home_score: homeValue,
          away_score: awayValue,
          home_penalties: penalties ? penalties.home : null,
          away_penalties: penalties ? penalties.away : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el resultado')
      }

      onSaved(data.match)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err: any) {
      setError(err.message || 'Error al guardar el resultado')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveResult = () => {
    if (!showPenalties) {
      updateResult(homeScore, awayScore, null)
      return
    }

    if (homePenalties === '' || awayPenalties === '') {
      setError('Si el partido termina en penales, ingresá el resultado de la definición')
      return
    }

    if (homePenalties === awayPenalties) {
      setError('Los penales no pueden terminar empatados')
      return
    }

    updateResult(homeScore, awayScore, { home: homePenalties, away: awayPenalties })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.home_team] || 'xx'] || 'xx'} w-10 h-10 rounded`}></span>
          <p className="text-sm font-semibold text-slate-900">{match.home_team}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-3">
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
              className="h-10 w-14 rounded-lg border border-slate-200 text-center text-sm"
            />
            <span className="text-xs font-semibold text-slate-400">vs</span>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
              className="h-10 w-14 rounded-lg border border-slate-200 text-center text-sm"
            />
          </div>
          {showPenalties && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400">Penales</span>
              <input
                type="number"
                min="0"
                value={homePenalties}
                onChange={(e) => setHomePenalties(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className="h-8 w-12 rounded-lg border border-slate-200 text-center text-xs"
              />
              <span className="text-xs font-semibold text-slate-400">-</span>
              <input
                type="number"
                min="0"
                value={awayPenalties}
                onChange={(e) => setAwayPenalties(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className="h-8 w-12 rounded-lg border border-slate-200 text-center text-xs"
              />
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <p className="text-sm font-semibold text-slate-900">{match.away_team}</p>
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.away_team] || 'xx'] || 'xx'} w-10 h-10 rounded`}></span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>
          {formatDate(match.match_date)}
          {match.status === 'finished' && match.home_penalties != null && match.away_penalties != null && (
            <span className="ml-2 font-semibold text-slate-600">
              · Penales {match.home_penalties}-{match.away_penalties}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 font-semibold ${
              match.status === 'finished' ? 'bg-slate-100 text-slate-700' : 'bg-sky-100 text-sky-700'
            }`}
          >
            {match.status === 'finished' ? 'Finalizado' : 'Por jugar'}
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={handleSaveResult}
            className="rounded-full bg-sky-600 px-4 py-1 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar resultado'}
          </button>
          {hasResult && (
            <button
              type="button"
              disabled={loading}
              onClick={() => updateResult(null, null, null)}
              className="rounded-full bg-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
            >
              Borrar resultado
            </button>
          )}
          {success && <span className="text-sky-700">Guardado</span>}
          {error && <span className="text-rose-600">{error}</span>}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/auth/login')
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_URL}/api/user/me`, { headers }),
      fetch(`${API_URL}/api/matches`, { headers }),
    ])
      .then(async ([userRes, matchesRes]) => {
        if (userRes.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/auth/login')
          return
        }

        const userData = await userRes.json()

        if (!userData.user?.is_admin) {
          router.replace('/dashboard')
          return
        }

        setAuthorized(true)
        setDisplayName(`${userData.user.nombre} ${userData.user.apellido}`)

        const matchesData = await matchesRes.json()
        setMatches(matchesData.matches || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  const handleSaved = (updated: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)))
  }

  const { groupStages, knockoutStages } = useMemo(() => {
    const group: Record<string, Match[]> = {}
    const knockout: Record<string, Match[]> = {}

    matches.forEach((match) => {
      if (isGroupStage(match.stage)) {
        const groupLetter = TEAM_TO_GROUP[match.home_team] || 'Otros'
        if (!group[groupLetter]) group[groupLetter] = []
        group[groupLetter].push(match)
      } else {
        if (!knockout[match.stage]) knockout[match.stage] = []
        knockout[match.stage].push(match)
      }
    })

    const sortByDate = (list: Match[]) =>
      list.sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

    Object.values(group).forEach(sortByDate)
    Object.values(knockout).forEach(sortByDate)

    return {
      groupStages: Object.entries(group).sort(([a], [b]) => a.localeCompare(b)),
      knockoutStages: Object.entries(knockout),
    }
  }, [matches])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <DashboardNav displayName={displayName} isAdmin />
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Panel de Administración</h1>
          <p className="mt-2 text-sm text-slate-600">
            Cargá el resultado de cada partido y guardalo para calcular los puntos automáticamente. Si no
            cargás resultado, el partido queda "Por jugar".
          </p>
        </div>

        <div className="grid gap-6">
          {groupStages.map(([groupLetter, matchList]) => (
            <div key={groupLetter} className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Grupo {groupLetter}</h2>
              <div className="mt-4 grid gap-4">
                {matchList.map((match) => (
                  <AdminMatchRow key={match.id} match={match} onSaved={handleSaved} />
                ))}
              </div>
            </div>
          ))}

          {knockoutStages.map(([stage, matchList]) => (
            <div key={stage} className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{stage}</h2>
              <div className="mt-4 grid gap-4">
                {matchList.map((match) => (
                  <AdminMatchRow key={match.id} match={match} onSaved={handleSaved} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
