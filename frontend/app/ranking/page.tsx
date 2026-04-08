'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/ui/DashboardNav'
import { API_URL } from '@/lib/config'

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
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [displayName, setDisplayName] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
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
      setCurrentUserId(u.id)
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
        setRanking(data.ranking || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <p className="text-slate-500">Cargando ranking...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <DashboardNav displayName={displayName} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Ranking</h1>
          <p className="mt-2 text-sm text-slate-600">Posiciones actuales de todos los participantes</p>
        </div>

        <div className="mt-6 rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tabla de Posiciones</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">POS</th>
                  <th className="px-4 py-3">PARTICIPANTE</th>
                  <th className="px-4 py-3 text-center">PREDICCIONES</th>
                  <th className="px-4 py-3 text-center">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ranking.length > 0 ? (
                  ranking.map((entry, index) => (
                    <tr key={entry.user_id} className={entry.user_id === currentUserId ? 'bg-sky-50' : ''}>
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : null}
                          <span>{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                            {entry.nombre?.charAt(0)?.toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {entry.nombre} {entry.apellido}
                              {entry.user_id === currentUserId ? ' (Tú)' : ''}
                            </p>
                            <p className="text-[11px] text-slate-400">{entry.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">{entry.total_predictions}</td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-900">{entry.total_points}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
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
