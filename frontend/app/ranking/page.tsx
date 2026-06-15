'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
}

interface UserPrediction {
  id: string
  match_id: string
  predicted_home_score: number
  predicted_away_score: number
  points: number
  home_team: string
  away_team: string
  match_date: string
  status: 'scheduled' | 'live' | 'finished'
  home_score: number | null
  away_score: number | null
  stage: string
}

function UserPredictionsModal({
  user,
  predictions,
  loading,
  onClose,
}: {
  user: RankingEntry
  predictions: UserPrediction[]
  loading: boolean
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Predicciones de {user.nombre} {user.apellido}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Cargando predicciones...</p>
        ) : predictions.length > 0 ? (
          <div className="mt-4 space-y-2">
            {predictions.map((pred) => (
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
                    {pred.status === 'finished' && pred.home_score !== null && pred.away_score !== null && (
                      <> · Resultado: {pred.home_score} - {pred.away_score}</>
                    )}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                  {pred.points} pts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Todavía no hay predicciones visibles para este participante.
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
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(ranking.length / PAGE_SIZE))
  const pagedRanking = ranking.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const openUserPredictions = (entry: RankingEntry) => {
    setSelectedUser(entry)
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
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Ranking</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Posiciones actuales de todos los participantes</p>
        </div>

        <div className="mt-6 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-400">
          🆕 <strong>Nueva regla para la fase eliminatoria:</strong> a partir de dieciseisavos de final, sumás +1 punto extra
          si tu pronóstico acierta el marcador final de uno de los dos equipos (ej: predijiste 2-1 y el resultado real
          fue 2-0, acertaste el "2" del local). No se acumula con el bonus de resultado exacto. Mirá el detalle
          completo en la pestaña de Reglas.
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
                  <th className="px-4 py-3 text-center">MARCADOR</th>
                  <th className="px-4 py-3 text-center">BONUS</th>
                  <th className="px-4 py-3 text-center">RESULTADO</th>
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
                      <td className="px-4 py-4 text-center font-semibold text-slate-900 dark:text-slate-100">{entry.exact_scores}</td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-900 dark:text-slate-100">{entry.score_bonus}</td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-900 dark:text-slate-100">{entry.correct_results}</td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-900 dark:text-slate-100">{entry.total_points}</td>
                    </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
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
      {selectedUser && (
        <UserPredictionsModal
          user={selectedUser}
          predictions={userPredictions}
          loading={predictionsLoading}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}
