export const dynamic = "force-dynamic";
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/ui/DashboardNav'

export default async function RankingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get leaderboard data
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <DashboardNav user={user} />
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
                  <th className="px-4 py-3 text-center">GRUPOS</th>
                  <th className="px-4 py-3 text-center">D16</th>
                  <th className="px-4 py-3 text-center">OCT</th>
                  <th className="px-4 py-3 text-center">CUA</th>
                  <th className="px-4 py-3 text-center">SEMI</th>
                  <th className="px-4 py-3 text-center">FINAL</th>
                  <th className="px-4 py-3 text-center">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((entry: any, index: number) => (
                    <tr key={entry.user_id} className={entry.user_id === user.id ? 'bg-sky-50' : ''}>
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : null}
                          <span>{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                            {(entry.username || entry.email)?.charAt(0)?.toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {entry.username || entry.email}
                              {entry.user_id === user.id ? ' (Tu)' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">0</td>
                      <td className="px-4 py-4 text-center">0</td>
                      <td className="px-4 py-4 text-center">0</td>
                      <td className="px-4 py-4 text-center">0</td>
                      <td className="px-4 py-4 text-center">0</td>
                      <td className="px-4 py-4 text-center">0</td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-900">
                        {entry.total_points}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                      No hay rankings disponibles aún. ¡Comienza a hacer predicciones!
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
