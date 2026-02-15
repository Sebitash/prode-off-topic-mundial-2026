'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Match {
  id: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  match_date: string
  stage: string
  status: 'scheduled' | 'live' | 'finished'
}

const PRIMARY_TAB_LABELS = {
  group: 'Fase de Grupos',
  knockout: 'Fase Eliminatoria',
}

const SECONDARY_TABS = ['Resultados', 'Tablas de Posiciones', 'Mejores Terceros']

const mockGroups = [
  {
    group: 'Grupo A',
    teams: [
      { name: 'Jamaica', code: 'JAM' },
      { name: 'Marruecos', code: 'MAR' },
      { name: 'Mexico', code: 'MEX' },
      { name: 'Uruguay', code: 'URU' },
    ],
  },
  {
    group: 'Grupo B',
    teams: [
      { name: 'Canada', code: 'CAN' },
      { name: 'Colombia', code: 'COL' },
      { name: 'Senegal', code: 'SEN' },
      { name: 'Tunez', code: 'TUN' },
    ],
  },
  {
    group: 'Grupo C',
    teams: [
      { name: 'Costa Rica', code: 'CRC' },
      { name: 'Croacia', code: 'CRO' },
      { name: 'Egipto', code: 'EGY' },
      { name: 'Espana', code: 'ESP' },
    ],
  },
  {
    group: 'Grupo D',
    teams: [
      { name: 'Alemania', code: 'GER' },
      { name: 'Australia', code: 'AUS' },
      { name: 'Estados Unidos', code: 'USA' },
      { name: 'Japon', code: 'JPN' },
    ],
  },
  {
    group: 'Grupo E',
    teams: [
      { name: 'Belgica', code: 'BEL' },
      { name: 'Brasil', code: 'BRA' },
      { name: 'Camerun', code: 'CMR' },
      { name: 'Suiza', code: 'SUI' },
    ],
  },
  {
    group: 'Grupo F',
    teams: [
      { name: 'Argentina', code: 'ARG' },
      { name: 'Dinamarca', code: 'DEN' },
      { name: 'Francia', code: 'FRA' },
      { name: 'Nigeria', code: 'NGA' },
    ],
  },
  {
    group: 'Grupo G',
    teams: [
      { name: 'Corea del Sur', code: 'KOR' },
      { name: 'Ecuador', code: 'ECU' },
      { name: 'Inglaterra', code: 'ENG' },
      { name: 'Paises Bajos', code: 'NED' },
    ],
  },
  {
    group: 'Grupo H',
    teams: [
      { name: 'Ghana', code: 'GHA' },
      { name: 'Italia', code: 'ITA' },
      { name: 'Polonia', code: 'POL' },
      { name: 'Portugal', code: 'POR' },
    ],
  },
]

const mockThirds = [
  { name: 'Camerun', code: 'CMR', group: 'E', status: 'Clasificado' },
  { name: 'Egipto', code: 'EGY', group: 'C', status: 'Clasificado' },
  { name: 'Estados Unidos', code: 'USA', group: 'D', status: 'Clasificado' },
  { name: 'Francia', code: 'FRA', group: 'F', status: 'Clasificado' },
  { name: 'Inglaterra', code: 'ENG', group: 'G', status: 'Clasificado' },
  { name: 'Mexico', code: 'MEX', group: 'A', status: 'Clasificado' },
  { name: 'Noruega', code: 'NOR', group: 'K', status: 'Clasificado' },
  { name: 'Polonia', code: 'POL', group: 'H', status: 'Clasificado' },
  { name: 'Republica Checa', code: 'CZE', group: 'L', status: 'Eliminado' },
  { name: 'Senegal', code: 'SEN', group: 'B', status: 'Eliminado' },
  { name: 'Serbia', code: 'SRB', group: 'I', status: 'Eliminado' },
  { name: 'Turquia', code: 'TUR', group: 'J', status: 'Eliminado' },
]

function ThirdsTable() {
  return (
    <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">★</span>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Tabla de Mejores Terceros</h3>
          <p className="text-xs text-slate-500">
            Los 8 mejores terceros clasifican a la siguiente ronda (Dieciseisavos de final)
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-sky-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Equipo</th>
              <th className="px-3 py-2 text-center">Grupo</th>
              <th className="px-3 py-2 text-center">PJ</th>
              <th className="px-3 py-2 text-center">G</th>
              <th className="px-3 py-2 text-center">E</th>
              <th className="px-3 py-2 text-center">P</th>
              <th className="px-3 py-2 text-center">GF</th>
              <th className="px-3 py-2 text-center">GC</th>
              <th className="px-3 py-2 text-center">DIF</th>
              <th className="px-3 py-2 text-center">PTS</th>
              <th className="px-3 py-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {mockThirds.map((team, index) => {
              const isQualified = team.status === 'Clasificado'
              return (
                <tr
                  key={`${team.code}-${team.group}`}
                  className={isQualified ? 'bg-emerald-50' : 'bg-rose-50'}
                >
                  <td className="px-3 py-2 font-semibold text-slate-700">{index + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-800">
                      {team.name}
                      <span className="ml-1 text-[10px] text-slate-400">{team.code}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-700 text-[10px] font-semibold text-white">
                      {team.group}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">0</td>
                  <td className="px-3 py-2 text-center">0</td>
                  <td className="px-3 py-2 text-center">0</td>
                  <td className="px-3 py-2 text-center">0</td>
                  <td className="px-3 py-2 text-center">0</td>
                  <td className="px-3 py-2 text-center">0</td>
                  <td className="px-3 py-2 text-center">0</td>
                  <td className="px-3 py-2 text-center font-semibold text-slate-800">0</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        isQualified ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isQualified ? '✓ Clasificado' : '✕ Eliminado'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg bg-sky-50 px-4 py-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Criterios de Clasificacion (en orden):</p>
        <ol className="mt-2 grid gap-1">
          <li>1. Mayor cantidad de puntos obtenidos</li>
          <li>2. Mejor diferencia de goles</li>
          <li>3. Mayor cantidad de goles marcados</li>
          <li>4. Menor cantidad de goles recibidos</li>
          <li>5. Mayor cantidad de victorias</li>
        </ol>
      </div>
    </div>
  )
}

function GroupTable({ group, teams }: { group: string; teams: { name: string; code: string }[] }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs text-sky-700">
          {group.split(' ')[1]}
        </span>
        {group}
      </div>
      <div className="mt-3 rounded-lg border border-sky-100">
        <div className="grid grid-cols-[2fr_repeat(7,1fr)] gap-2 border-b border-sky-100 bg-sky-50 px-3 py-2 text-[11px] font-semibold uppercase text-slate-500">
          <span>Equipo</span>
          <span className="text-center">PJ</span>
          <span className="text-center">G</span>
          <span className="text-center">E</span>
          <span className="text-center">P</span>
          <span className="text-center">GF</span>
          <span className="text-center">GC</span>
          <span className="text-center">PTS</span>
        </div>
        {teams.map((team, index) => (
          <div
            key={team.code}
            className={`grid grid-cols-[2fr_repeat(7,1fr)] gap-2 px-3 py-2 text-xs text-slate-700 ${
              index === 0
                ? 'bg-emerald-50'
                : index === 1
                ? 'bg-sky-50'
                : index === 2
                ? 'bg-amber-50'
                : 'bg-white'
            }`}
          >
            <span className="font-semibold text-slate-800">
              {team.name} <span className="ml-1 text-[10px] text-slate-400">{team.code}</span>
            </span>
            <span className="text-center">0</span>
            <span className="text-center">0</span>
            <span className="text-center">0</span>
            <span className="text-center">0</span>
            <span className="text-center">0</span>
            <span className="text-center">0</span>
            <span className="text-center font-semibold text-slate-900">0</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Clasificado directo
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          Mejor tercero
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          Eliminado
        </span>
      </div>
    </div>
  )
}


function isGroupStage(stage: string) {
  const value = stage.toLowerCase()
  return value.includes('group') || value.includes('grupo')
}

function formatDate(value: string) {
  const iso = new Date(value).toISOString()
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`
}

function statusLabel(status: Match['status']) {
  if (status === 'finished') return 'Finalizado'
  if (status === 'live') return 'En vivo'
  return 'Por jugar'
}

function statusStyles(status: Match['status']) {
  if (status === 'finished') return 'bg-slate-100 text-slate-700'
  if (status === 'live') return 'bg-rose-100 text-rose-700'
  return 'bg-sky-100 text-sky-700'
}

function ResultRow({
  match,
  userId,
  allowPredict,
}: {
  match: Match
  userId: string
  allowPredict: boolean
}) {
  const [homeScore, setHomeScore] = useState<number>(0)
  const [awayScore, setAwayScore] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const isFinished = match.status === 'finished'
  const isPast = new Date(match.match_date) < new Date()
  const canPredict = allowPredict && !isFinished && !isPast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canPredict) return

    setLoading(true)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: userId,
          match_id: match.id,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        } as any, {
          onConflict: 'user_id,match_id',
        })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (error) {
      console.error('Error saving prediction:', error)
      alert('Failed to save prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sky-100" />
          <div>
            <p className="text-sm font-semibold text-slate-900">{match.home_team}</p>
            {isFinished && match.home_score !== null && (
              <p className="text-lg font-semibold text-sky-700">{match.home_score}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {canPredict ? (
            <>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                className="h-10 w-12 rounded-lg border border-slate-200 text-center text-sm"
              />
              <span className="text-xs font-semibold text-slate-400">vs</span>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                className="h-10 w-12 rounded-lg border border-slate-200 text-center text-sm"
              />
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-9 w-10 rounded-lg border border-slate-200 bg-slate-50 text-center leading-9">
                {match.home_score ?? '-'}
              </span>
              <span className="text-slate-400">vs</span>
              <span className="h-9 w-10 rounded-lg border border-slate-200 bg-slate-50 text-center leading-9">
                {match.away_score ?? '-'}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{match.away_team}</p>
            {isFinished && match.away_score !== null && (
              <p className="text-lg font-semibold text-sky-700">{match.away_score}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-sky-100" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>{formatDate(match.match_date)}</span>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 font-semibold ${statusStyles(match.status)}`}>
            {statusLabel(match.status)}
          </span>
          {canPredict && (
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-sky-600 px-4 py-1 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          )}
          {success && <span className="text-sky-700">Pronostico guardado</span>}
        </div>
      </div>
    </form>
  )
}

export default function ResultsTabs({
  matches,
  userId,
  allowPredict = true,
  showSecondaryTabs = true,
  title = 'Resultados y Cronograma',
  description = 'Sigue los resultados reales del Mundial 2026',
}: {
  matches: Match[]
  userId: string
  allowPredict?: boolean
  showSecondaryTabs?: boolean
  title?: string
  description?: string
}) {
  const [activePrimary, setActivePrimary] = useState<'group' | 'knockout'>('group')
  const [activeSecondary, setActiveSecondary] = useState('Resultados')

  const { groupStages, knockoutStages } = useMemo(() => {
    const group: Record<string, Match[]> = {}
    const knockout: Record<string, Match[]> = {}

    matches.forEach((match) => {
      const collection = isGroupStage(match.stage) ? group : knockout
      if (!collection[match.stage]) {
        collection[match.stage] = []
      }
      collection[match.stage].push(match)
    })

    const sortByDate = (list: Match[]) =>
      list.sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

    Object.values(group).forEach(sortByDate)
    Object.values(knockout).forEach(sortByDate)

    return { groupStages: group, knockoutStages: knockout }
  }, [matches])

  const stages = activePrimary === 'group' ? groupStages : knockoutStages
  const stageEntries = Object.entries(stages)

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
          {(Object.keys(PRIMARY_TAB_LABELS) as Array<'group' | 'knockout'>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivePrimary(key)}
              className={`border-b-2 pb-3 transition ${
                activePrimary === key ? 'border-sky-600 text-sky-700' : 'border-transparent'
              }`}
            >
              {PRIMARY_TAB_LABELS[key]}
            </button>
          ))}
        </div>
        {showSecondaryTabs && activePrimary === 'group' && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
            {SECONDARY_TABS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveSecondary(label)}
                className={`rounded-full px-3 py-1 ${
                  activeSecondary === label
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showSecondaryTabs && activeSecondary === 'Tablas de Posiciones' && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            Tablas oficiales segun los resultados reales del mundial. Los primeros 2 de cada grupo clasifican
            directamente, y los mejores 8 terceros tambien avanzan.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mockGroups.map((group) => (
              <GroupTable key={group.group} group={group.group} teams={group.teams} />
            ))}
          </div>
        </div>
      )}

      {showSecondaryTabs && activeSecondary === 'Mejores Terceros' && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            Clasificacion oficial de mejores terceros. Los 8 equipos mejor posicionados entre todos los terceros
            clasifican a la siguiente ronda.
          </div>
          <ThirdsTable />
        </div>
      )}

      {(!showSecondaryTabs || activeSecondary === 'Resultados') && (
        <div className="grid gap-6">
        {stageEntries.length === 0 && (
          <div className="rounded-2xl border border-sky-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">No hay partidos disponibles.</p>
          </div>
        )}

        {stageEntries.map(([stage, list]) => (
          <div key={stage} className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{stage}</h2>
            <div className="mt-4 grid gap-4">
              {list.map((match) => (
                <ResultRow key={match.id} match={match} userId={userId} allowPredict={allowPredict} />
              ))}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
