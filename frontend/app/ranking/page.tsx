'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/ui/DashboardNav'
import { API_URL } from '@/lib/config'
import { getCache, setCache } from '@/lib/dataCache'

interface RankingEntry {
  user_id: string
  nombre: string
  apellido: string
  email: string
  total_points: number
  total_predictions: number
}

export default function RankingPage() {
  const router = useRouter()
  const [ranking, setRanking] = useState<RankingEntry[]>(() => getCache<RankingEntry[]>('ranking') || [])
  const [displayName, setDisplayName] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(ranking.length === 0)

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
        setCache('ranking', data.ranking || [])
        setRanking(data.ranking || [])
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardNav displayName={displayName} isAdmin={isAdmin} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Ranking</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Posiciones actuales de todos los participantes</p>
        </div>

        <div className="mt-6 rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Premios</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Premios para el top 3 del ranking final (a confirmar)</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
              <p className="text-2xl">🥇</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">1° Puesto</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A definir</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 text-center">
              <p className="text-2xl">🥈</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">2° Puesto</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A definir</p>
            </div>
            <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-4 text-center">
              <p className="text-2xl">🥉</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">3° Puesto</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A definir</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tabla de Posiciones</h2>
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
                {ranking.length > 0 ? (
                  ranking.map((entry, index) => (
                    <tr key={entry.user_id} className={entry.user_id === currentUserId ? 'bg-sky-50 dark:bg-sky-950/40' : ''}>
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
                      <td className="px-4 py-4 text-center font-semibold text-slate-900 dark:text-slate-100">{entry.total_points}</td>
                    </tr>
                  ))
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
        </div>
      </div>
    </div>
  )
}
