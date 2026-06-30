'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardNav from '@/components/ui/DashboardNav'
import { API_URL } from '@/lib/config'
import { getCache, setCache } from '@/lib/dataCache'
import { FLAG_CODES, TEAM_TO_CODE, TEAM_TO_GROUP, isGroupStage, formatDate } from '@/components/matches/ResultsTabs'

interface RankingEntry {
  user_id: string
  nombre: string
  apellido: string
  email: string
  total_points: number
  total_predictions: number
  exact_scores: number
  score_bonus: number
  correct_results: number
  rank_change: number
}

interface UserPrediction {
  id: string
  match_id: string
  predicted_home_score: number
  predicted_away_score: number
  predicted_penalty_winner: 'home' | 'away' | null
  points: number
  home_team: string
  away_team: string
  match_date: string
  status: 'scheduled' | 'live' | 'finished'
  home_score: number | null
  away_score: number | null
  home_penalties: number | null
  away_penalties: number | null
  stage: string
}

type Phase = 'group' | 'knockout'

function explainPoints(pred: UserPrediction): string | null {
  if (pred.status !== 'finished' || pred.home_score === null || pred.away_score === null) return null

  const isGroup = isGroupStage(pred.stage)
  const winnerPts = isGroup ? 2 : 3
  const exactPts = isGroup ? 1 : 2

  let actualWinner: 'home' | 'away' | 'draw'
  if (pred.home_score > pred.away_score) actualWinner = 'home'
  else if (pred.home_score < pred.away_score) actualWinner = 'away'
  else if (pred.home_penalties != null && pred.away_penalties != null && pred.home_penalties !== pred.away_penalties)
    actualWinner = pred.home_penalties > pred.away_penalties ? 'home' : 'away'
  else actualWinner = 'draw'

  let predictedWinner: 'home' | 'away' | 'draw'
  if (pred.predicted_home_score > pred.predicted_away_score) predictedWinner = 'home'
  else if (pred.predicted_home_score < pred.predicted_away_score) predictedWinner = 'away'
  else if (pred.predicted_penalty_winner) predictedWinner = pred.predicted_penalty_winner
  else predictedWinner = 'draw'

  const gotWinner = predictedWinner === actualWinner
  const exactScore = pred.predicted_home_score === pred.home_score && pred.predicted_away_score === pred.away_score
  const partialScore = !isGroup && !exactScore && (pred.predicted_home_score === pred.home_score || pred.predicted_away_score === pred.away_score)
  const penaltyBonus = !isGroup && pred.home_penalties != null && pred.away_penalties != null
    && pred.predicted_home_score === pred.predicted_away_score && pred.predicted_penalty_winner != null

  const parts: string[] = []
  if (gotWinner) parts.push(`ganador +${winnerPts}`)
  if (exactScore) parts.push(`exacto +${exactPts}`)
  if (partialScore) parts.push('parcial +1')
  if (penaltyBonus) parts.push('bonus penales +1')

  return parts.length > 0 ? parts.join(', ') : 'sin coincidencias'
}

interface PhaseStats {
  predictions: number
  exact: number
  correctResults: number
  bonus: number
  totalPoints: number
}

function isKnockoutPrediction(pred: UserPrediction) {
  return !isGroupStage(pred.stage)
}

function computePhaseStats(predictions: UserPrediction[], phase: Phase): PhaseStats {
  const filtered = predictions.filter((p) => (phase === 'group' ? isGroupStage(p.stage) : isKnockoutPrediction(p)))

  return filtered.reduce<PhaseStats>(
    (acc, pred) => {
      const exact = phase === 'group' ? pred.points === 3 : pred.points === 5
      const bonus = phase === 'knockout' && (pred.points === 1 || pred.points === 4)
      const correctResult = phase === 'group' ? pred.points >= 2 : pred.points >= 3

      return {
        predictions: acc.predictions + 1,
        exact: acc.exact + (exact ? 1 : 0),
        correctResults: acc.correctResults + (correctResult ? 1 : 0),
        bonus: acc.bonus + (bonus ? 1 : 0),
        totalPoints: acc.totalPoints + pred.points,
      }
    },
    { predictions: 0, exact: 0, correctResults: 0, bonus: 0, totalPoints: 0 }
  )
}

function PlayerSummaryModal({
  user,
  predictions,
  loading,
  onClose,
  onViewPhase,
}: {
  user: RankingEntry
  predictions: UserPrediction[]
  loading: boolean
  onClose: () => void
  onViewPhase: (phase: Phase) => void
}) {
  const groupStats = computePhaseStats(predictions, 'group')
  const knockoutStats = computePhaseStats(predictions, 'knockout')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {user.nombre} {user.apellido}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Cargando estadísticas...</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-sky-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fase de Grupos</h3>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-sky-700 dark:text-sky-400">{groupStats.exact}</p>
                  <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Marcador (+1)</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-sky-700 dark:text-sky-400">{groupStats.correctResults}</p>
                  <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Resultados (+2)</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">{groupStats.totalPoints}</p>
                  <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Total</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewPhase('group')}
                className="mt-3 w-full rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
              >
                Ver predicciones de fase de grupos →
              </button>
            </div>

            <div className="rounded-xl border border-sky-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fase Eliminatoria</h3>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-sky-700 dark:text-sky-400">{knockoutStats.exact}</p>
                  <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Marcador (+2)</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-sky-700 dark:text-sky-400">{knockoutStats.correctResults}</p>
                  <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Resultados (+3)</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">{knockoutStats.bonus}</p>
                  <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Bonus (+1)</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">{knockoutStats.totalPoints}</p>
                  <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Total</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewPhase('knockout')}
                className="mt-3 w-full rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
              >
                Ver predicciones de fase eliminatoria →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PhasePredictionsModal({
  user,
  predictions,
  phase,
  onBack,
  onClose,
}: {
  user: RankingEntry
  predictions: UserPrediction[]
  phase: Phase
  onBack: () => void
  onClose: () => void
}) {
  const filtered = predictions
    .filter((p) => (phase === 'group' ? isGroupStage(p.stage) : isKnockoutPrediction(p)))
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
  const totalPoints = filtered.reduce((sum, p) => sum + p.points, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              ←
            </button>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {phase === 'group' ? 'Fase de Grupos' : 'Fase Eliminatoria'} · {user.nombre} {user.apellido}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-sky-50 dark:bg-sky-950/40 px-4 py-3 text-sm font-semibold text-sky-800 dark:text-sky-400">
            <span>Total {phase === 'group' ? 'fase de grupos' : 'fase eliminatoria'}</span>
            <span>{totalPoints} pts</span>
          </div>
        )}

        {filtered.length > 0 ? (
          <>
            <div className="mt-4 space-y-2">
              {filtered.map((pred) => (
                <div
                  key={pred.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3"
                >
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {isGroupStage(pred.stage) ? `Grupo ${TEAM_TO_GROUP[pred.home_team] || '?'}` : pred.stage} · {formatDate(pred.match_date)}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                      <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[pred.home_team] || 'xx'] || 'xx'} w-5 h-5 rounded`}></span>
                      {pred.home_team} vs {pred.away_team}
                      <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[pred.away_team] || 'xx'] || 'xx'} w-5 h-5 rounded`}></span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Pronóstico: {pred.predicted_home_score} - {pred.predicted_away_score}
                      {pred.predicted_penalty_winner && (
                        <> (pen. {pred.predicted_penalty_winner === 'home' ? pred.home_team : pred.away_team})</>
                      )}
                      {pred.status === 'finished' && pred.home_score !== null && pred.away_score !== null && (
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {' · '}Resultado: {pred.home_score} - {pred.away_score}
                          {pred.home_penalties != null && pred.away_penalties != null && (
                            <> (pen. {pred.home_penalties > pred.away_penalties ? pred.home_team : pred.away_team})</>
                          )}
                        </span>
                      )}
                    </p>
                    {pred.status === 'finished' && (
                      <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                        {explainPoints(pred)}
                      </p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-white ${pred.points === 0 ? 'bg-slate-400 dark:bg-slate-600' : 'bg-emerald-600'}`}>
                    {pred.points} pts
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Todavía no hay predicciones visibles para esta fase.
          </p>
        )}
      </div>
    </div>
  )
}

const PAGE_SIZE = 25

export default function RankingPage() {
  const router = useRouter()
  const [ranking, setRanking] = useState<RankingEntry[]>(() => getCache<RankingEntry[]>('ranking') || [])
  const [displayName, setDisplayName] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(ranking.length === 0)
  const [selectedUser, setSelectedUser] = useState<RankingEntry | null>(null)
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>([])
  const [predictionsLoading, setPredictionsLoading] = useState(false)
  const [phaseModal, setPhaseModal] = useState<Phase | null>(null)
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(ranking.length / PAGE_SIZE))
  const pagedRanking = ranking.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const openUserPredictions = (entry: RankingEntry) => {
    setSelectedUser(entry)
    setPhaseModal(null)
    setUserPredictions([])
    setPredictionsLoading(true)

    const token = localStorage.getItem('token')
    fetch(`${API_URL}/api/predictions/user/${entry.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { predictions: [] }))
      .then((data) => setUserPredictions(data.predictions || []))
      .catch(console.error)
      .finally(() => setPredictionsLoading(false))
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token) {
      router.replace('/auth/login')
      return
    }

    let userId = ''
    if (storedUser) {
      const u = JSON.parse(storedUser)
      setDisplayName(`${u.nombre} ${u.apellido}`)
      setCurrentUserId(u.id)
      setIsAdmin(!!u.is_admin)
      userId = u.id
    }

    fetch(`${API_URL}/api/ranking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('token')
          router.replace('/auth/login')
          return
        }
        const data = await res.json()
        const rows = data.ranking || []
        setCache('ranking', rows)
        setRanking(rows)

        const myIndex = rows.findIndex((entry: RankingEntry) => entry.user_id === userId)
        if (myIndex >= 0) {
          setPage(Math.floor(myIndex / PAGE_SIZE))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  if (loading && ranking.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Cargando ranking...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardNav displayName={displayName} isAdmin={isAdmin} />
      <div className="relative overflow-hidden">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Posiciones</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Posiciones actuales de todos los participantes</p>
        </div>

        <div className="mt-6 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 px-4 py-3 text-sm text-orange-800 dark:text-orange-400">
          🔔 <strong>Actualización de reglas:</strong> se ajustaron dos reglas de puntuación de la fase eliminatoria y los puntajes fueron recalculados automáticamente.{' '}
          <Link href="/dashboard/rules" className="font-semibold underline">Ver reglas actualizadas →</Link>
        </div>

        <div className="mt-6 rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Premios</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Premios para el top 3 del ranking final</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
              <p className="text-2xl">🥇</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">1° Puesto</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Gift card 100k Adidas</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 text-center">
              <p className="text-2xl">🥈</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">2° Puesto</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Fernet 750cl + Coca Cola 2,5L + six pack de cerveza</p>
            </div>
            <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-4 text-center">
              <p className="text-2xl">🥉</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">3° Puesto</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Fernet 750cl + Coca Cola 2,5L</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            ⚖️ En caso de empate en puntos, desempata quien haya acertado más marcadores exactos. Si persiste el empate, desempata quien haya acertado más veces el marcador de un solo equipo (bonus de eliminatorias). Si aún persiste el empate, desempata la cantidad total de pronósticos realizados.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tabla de Posiciones</h2>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-full border border-sky-300 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-sky-700 dark:text-sky-400 transition hover:bg-sky-50 dark:bg-sky-950/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Anterior
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Página {page + 1} de {totalPages}
              </p>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-full border border-sky-300 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-sky-700 dark:text-sky-400 transition hover:bg-sky-50 dark:bg-sky-950/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">POS</th>
                  <th className="px-4 py-3">PARTICIPANTE</th>
                  <th className="px-4 py-3 text-center">PREDICCIONES</th>
                  <th className="px-4 py-3 text-center">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {pagedRanking.length > 0 ? (
                  pagedRanking.map((entry, localIndex) => {
                    const index = page * PAGE_SIZE + localIndex
                    return (
                    <tr
                      key={entry.user_id}
                      onClick={() => openUserPredictions(entry)}
                      className={`cursor-pointer transition hover:bg-sky-50 dark:hover:bg-slate-700/60 ${entry.user_id === currentUserId ? 'bg-sky-50 dark:bg-sky-950/40' : ''}`}
                    >
                      <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : null}
                          <span>{index + 1}</span>
                          {entry.rank_change > 0 ? (
                            <span className="text-[10px] font-bold text-emerald-500">▲{entry.rank_change}</span>
                          ) : entry.rank_change < 0 ? (
                            <span className="text-[10px] font-bold text-red-500">▼{Math.abs(entry.rank_change)}</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {entry.nombre?.charAt(0)?.toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {entry.nombre} {entry.apellido}
                              {entry.user_id === currentUserId ? ' (Tú)' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-900 dark:text-slate-100">{entry.total_predictions}</td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-900 dark:text-slate-100">{entry.total_points}</td>
                    </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No hay rankings disponibles aún. ¡Comenzá a hacer predicciones!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-full border border-sky-300 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-sky-700 dark:text-sky-400 transition hover:bg-sky-50 dark:bg-sky-950/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Anterior
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Página {page + 1} de {totalPages}
              </p>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-full border border-sky-300 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-sky-700 dark:text-sky-400 transition hover:bg-sky-50 dark:bg-sky-950/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 dark:text-slate-500">Creado por Juan Sebastian Makkos · Sin fines de lucro</p>
      </div>
      </div>
      {selectedUser && !phaseModal && (
        <PlayerSummaryModal
          user={selectedUser}
          predictions={userPredictions}
          loading={predictionsLoading}
          onClose={() => setSelectedUser(null)}
          onViewPhase={(phase) => setPhaseModal(phase)}
        />
      )}
      {selectedUser && phaseModal && (
        <PhasePredictionsModal
          user={selectedUser}
          predictions={userPredictions}
          phase={phaseModal}
          onBack={() => setPhaseModal(null)}
          onClose={() => {
            setPhaseModal(null)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}
