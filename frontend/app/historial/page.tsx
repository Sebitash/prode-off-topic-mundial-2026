'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardNav from '@/components/ui/DashboardNav'
import { API_URL } from '@/lib/config'
import { getCache, setCache } from '@/lib/dataCache'
import { FLAG_CODES, TEAM_TO_CODE, TEAM_TO_GROUP, isGroupStage, formatDate } from '@/components/matches/ResultsTabs'

interface HistoryPrediction {
  user_id: string
  nombre: string
  apellido: string
  predicted_home_score: number
  predicted_away_score: number
  predicted_penalty_winner: 'home' | 'away' | null
  points: number
}

interface HistoryMatch {
  id: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  home_penalties: number | null
  away_penalties: number | null
  match_date: string
  stage: string
  predictions: HistoryPrediction[]
}

function pointsBadgeClass(points: number) {
  if (points <= 0) return 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
  if (points === 1) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
  if (points <= 3) return 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400'
  return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
}

function groupByPoints(predictions: HistoryPrediction[]) {
  const groups = new Map<number, HistoryPrediction[]>()
  for (const pred of predictions) {
    if (!groups.has(pred.points)) groups.set(pred.points, [])
    groups.get(pred.points)!.push(pred)
  }
  return Array.from(groups.entries()).sort((a, b) => b[0] - a[0])
}

function MatchHistoryCard({ match, currentUserId, defaultOpen = false }: { match: HistoryMatch; currentUserId: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const grouped = groupByPoints(match.predictions)

  return (
    <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.home_team] || 'xx'] || 'xx'} w-8 h-8 rounded`}></span>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
            {match.home_penalties != null && match.away_penalties != null && (
              <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                (pen. {match.home_penalties > match.away_penalties ? match.home_team : match.away_team})
              </span>
            )}
          </p>
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.away_team] || 'xx'] || 'xx'} w-8 h-8 rounded`}></span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-sky-100 dark:bg-sky-900/40 px-2 py-1 font-semibold text-sky-700 dark:text-sky-400">
            {isGroupStage(match.stage) ? `Grupo ${TEAM_TO_GROUP[match.home_team] || '?'}` : match.stage}
          </span>
          <span>{formatDate(match.match_date)}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-100 dark:border-slate-700 p-4">
          {grouped.length > 0 ? (
            grouped.map(([points, preds]) => (
              <div key={points}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {points} {points === 1 ? 'punto' : 'puntos'} ({preds.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {preds.map((pred) => (
                    <span
                      key={pred.user_id}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${pointsBadgeClass(points)} ${
                        pred.user_id === currentUserId ? 'ring-2 ring-sky-400 dark:ring-sky-500' : ''
                      }`}
                    >
                      {pred.nombre} {pred.apellido}
                      {pred.user_id === currentUserId ? ' (Tú)' : ''} · {pred.predicted_home_score}-{pred.predicted_away_score}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nadie pronosticó este partido.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function HistorialPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<HistoryMatch[]>(() => getCache<HistoryMatch[]>('history') || [])
  const [displayName, setDisplayName] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
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
      setCurrentUserId(u.id)
      setIsAdmin(!!u.is_admin)
    }

    fetch(`${API_URL}/api/predictions/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('token')
          router.replace('/auth/login')
          return
        }
        const data = await res.json()
        const rows = data.matches || []
        setCache('history', rows)
        setMatches(rows)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  if (loading && matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Cargando historial...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardNav displayName={displayName} isAdmin={isAdmin} />
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Historial</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Partidos finalizados y el puntaje que sacó cada participante
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 px-4 py-3 text-sm text-orange-800 dark:text-orange-400">
            <p>
              🔔 <span className="font-semibold">Actualización de reglas:</span> se ajustaron dos reglas de puntuación de la fase eliminatoria y los puntajes fueron recalculados automáticamente.{' '}
              <Link href="/dashboard/rules" className="font-semibold underline">Ver reglas actualizadas →</Link>
            </p>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match, index) => (
                <MatchHistoryCard key={match.id} match={match} currentUserId={currentUserId} defaultOpen={index === 0} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm">
              <p className="text-slate-600 dark:text-slate-400">Todavía no hay partidos finalizados.</p>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 dark:text-slate-500">Creado por Juan Sebastian Makkos · Sin fines de lucro</p>
        </div>
      </div>
    </div>
  )
}
