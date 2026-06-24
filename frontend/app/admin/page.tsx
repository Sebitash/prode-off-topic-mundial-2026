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
  ScoreStepper,
  CollapsibleSection,
  type Match,
} from '@/components/matches/ResultsTabs'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function AdminMatchRow({
  match,
  groupLabel,
  onSaved,
}: {
  match: Match
  groupLabel: string
  onSaved: (updated: Match) => void
}) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0)
  const [penaltyWinner, setPenaltyWinner] = useState<'home' | 'away' | null>(
    match.home_penalties != null && match.away_penalties != null
      ? (match.home_penalties > match.away_penalties ? 'home' : 'away')
      : null
  )
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

    if (!penaltyWinner) {
      setError('Si el partido termina en penales, elegí quién ganó la definición')
      return
    }

    const penalties = penaltyWinner === 'home' ? { home: 1, away: 0 } : { home: 0, away: 1 }
    updateResult(homeScore, awayScore, penalties)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.home_team] || 'xx'] || 'xx'} w-10 h-10 rounded`}></span>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{match.home_team}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-3">
            <ScoreStepper value={homeScore} onChange={setHomeScore} label={match.home_team} />
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">vs</span>
            <ScoreStepper value={awayScore} onChange={setAwayScore} label={match.away_team} />
          </div>
          {showPenalties && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">¿Quién gana en penales?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPenaltyWinner('home')}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    penaltyWinner === 'home' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {match.home_team}
                </button>
                <button
                  type="button"
                  onClick={() => setPenaltyWinner('away')}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    penaltyWinner === 'away' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {match.away_team}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{match.away_team}</p>
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.away_team] || 'xx'] || 'xx'} w-10 h-10 rounded`}></span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-700 pt-3 text-xs text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
        <span>
          <span className="mr-2 rounded-full bg-sky-100 dark:bg-sky-900/40 px-2 py-1 text-[10px] font-semibold text-sky-700 dark:text-sky-400">
            {groupLabel}
          </span>
          {formatDate(match.match_date)}
          {match.status === 'finished' && match.home_penalties != null && match.away_penalties != null && (
            <span className="ml-2 font-semibold text-slate-600 dark:text-slate-400">
              · Penales {match.home_penalties}-{match.away_penalties}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 font-semibold ${
              match.status === 'finished' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400'
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
              className="rounded-full bg-slate-200 dark:bg-slate-600 px-4 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-300 dark:bg-slate-600 disabled:opacity-50"
            >
              Borrar resultado
            </button>
          )}
          {success && <span className="text-sky-700 dark:text-sky-400">Guardado</span>}
          {error && <span className="text-rose-600 dark:text-rose-400">{error}</span>}
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

  const sortedMatches = useMemo(() => {
    return [...matches]
      .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
      .map((match) => ({
        match,
        groupLabel: isGroupStage(match.stage) ? `Grupo ${TEAM_TO_GROUP[match.home_team] || '?'}` : match.stage,
      }))
  }, [matches])

  const unsavedMatches = sortedMatches.filter(({ match }) => match.home_score === null || match.away_score === null)
  const savedMatches = sortedMatches.filter(({ match }) => match.home_score !== null && match.away_score !== null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardNav displayName={displayName} isAdmin />
      <div className="relative overflow-hidden">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Panel de Administración</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Cargá el resultado de cada partido y guardalo para calcular los puntos automáticamente. Si no
            cargás resultado, el partido queda "Por jugar".
          </p>
        </div>

        <CollapsibleSection title={`Sin resultado (${unsavedMatches.length})`} defaultOpen>
          {unsavedMatches.length > 0 ? (
            unsavedMatches.map(({ match, groupLabel }) => (
              <AdminMatchRow key={match.id} match={match} groupLabel={groupLabel} onSaved={handleSaved} />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No quedan partidos sin resultado.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title={`Con resultado guardado (${savedMatches.length})`}>
          {savedMatches.length > 0 ? (
            savedMatches.map(({ match, groupLabel }) => (
              <AdminMatchRow key={match.id} match={match} groupLabel={groupLabel} onSaved={handleSaved} />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no guardaste ningún resultado.</p>
          )}
        </CollapsibleSection>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500">Creado por Juan Sebastian Makkos · Sin fines de lucro</p>
      </div>
      </div>
    </div>
  )
}
