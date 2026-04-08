'use client'

import { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

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

const FLAG_CODES: Record<string, string> = {
  'MEX': 'mx',
  'RSA': 'za',
  'KOR': 'kr',
  'CZE': 'cz',
  'CAN': 'ca',
  'BIH': 'ba',
  'QAT': 'qa',
  'SUI': 'ch',
  'BRA': 'br',
  'MAR': 'ma',
  'HAI': 'ht',
  'SCO': 'gb-sct',
  'USA': 'us',
  'PAR': 'py',
  'AUS': 'au',
  'TUR': 'tr',
  'GER': 'de',
  'CUW': 'cw',
  'CIV': 'ci',
  'ECU': 'ec',
  'NED': 'nl',
  'JPN': 'jp',
  'SWE': 'se',
  'TUN': 'tn',
  'BEL': 'be',
  'EGY': 'eg',
  'IRN': 'ir',
  'NZL': 'nz',
  'ESP': 'es',
  'CPV': 'cv',
  'KSA': 'sa',
  'URY': 'uy',
  'FRA': 'fr',
  'SEN': 'sn',
  'IRQ': 'iq',
  'NOR': 'no',
  'ARG': 'ar',
  'ALG': 'dz',
  'AUT': 'at',
  'JOR': 'jo',
  'POR': 'pt',
  'COD': 'cd',
  'UZB': 'uz',
  'COL': 'co',
  'ENG': 'gb-eng',
  'CRO': 'hr',
  'GHA': 'gh',
  'PAN': 'pa',
}

const TEAM_TO_GROUP: Record<string, string> = {
  'México': 'A',
  'Sudáfrica': 'A',
  'República de Corea': 'A',
  'República Checa': 'A',
  'Canadá': 'B',
  'Bosnia y Herzegovina': 'B',
  'Catar': 'B',
  'Suiza': 'B',
  'Brasil': 'C',
  'Marruecos': 'C',
  'Haití': 'C',
  'Escocia': 'C',
  'Estados Unidos': 'D',
  'Paraguay': 'D',
  'Australia': 'D',
  'Turquía': 'D',
  'Alemania': 'E',
  'Curazao': 'E',
  'Costa de Marfil': 'E',
  'Ecuador': 'E',
  'Países Bajos': 'F',
  'Japón': 'F',
  'Suecia': 'F',
  'Túnez': 'F',
  'Bélgica': 'G',
  'Egipto': 'G',
  'Irán': 'G',
  'Nueva Zelanda': 'G',
  'España': 'H',
  'Cabo Verde': 'H',
  'Arabia Saudí': 'H',
  'Uruguay': 'H',
  'Francia': 'I',
  'Senegal': 'I',
  'Irak': 'I',
  'Noruega': 'I',
  'Argentina': 'J',
  'Argelia': 'J',
  'Austria': 'J',
  'Jordania': 'J',
  'Portugal': 'K',
  'RD del Congo': 'K',
  'Uzbekistán': 'K',
  'Colombia': 'K',
  'Inglaterra': 'L',
  'Croacia': 'L',
  'Ghana': 'L',
  'Panamá': 'L',
}

const TEAM_TO_CODE: Record<string, string> = {
  'México': 'MEX',
  'Sudáfrica': 'RSA',
  'República de Corea': 'KOR',
  'República Checa': 'CZE',
  'Canadá': 'CAN',
  'Bosnia y Herzegovina': 'BIH',
  'Catar': 'QAT',
  'Suiza': 'SUI',
  'Brasil': 'BRA',
  'Marruecos': 'MAR',
  'Haití': 'HAI',
  'Escocia': 'SCO',
  'Estados Unidos': 'USA',
  'Paraguay': 'PAR',
  'Australia': 'AUS',
  'Turquía': 'TUR',
  'Alemania': 'GER',
  'Curazao': 'CUW',
  'Costa de Marfil': 'CIV',
  'Ecuador': 'ECU',
  'Países Bajos': 'NED',
  'Japón': 'JPN',
  'Suecia': 'SWE',
  'Túnez': 'TUN',
  'Bélgica': 'BEL',
  'Egipto': 'EGY',
  'Irán': 'IRN',
  'Nueva Zelanda': 'NZL',
  'España': 'ESP',
  'Cabo Verde': 'CPV',
  'Arabia Saudí': 'KSA',
  'Uruguay': 'URY',
  'Francia': 'FRA',
  'Senegal': 'SEN',
  'Irak': 'IRQ',
  'Noruega': 'NOR',
  'Argentina': 'ARG',
  'Argelia': 'ALG',
  'Austria': 'AUT',
  'Jordania': 'JOR',
  'Portugal': 'POR',
  'RD del Congo': 'COD',
  'Uzbekistán': 'UZB',
  'Colombia': 'COL',
  'Inglaterra': 'ENG',
  'Croacia': 'CRO',
  'Ghana': 'GHA',
  'Panamá': 'PAN',
}

const PRIMARY_TAB_LABELS = {
  group: 'Fase de Grupos',
  knockout: 'Fase Eliminatoria',
}

const SECONDARY_TABS = ['Resultados', 'Tablas de Posiciones', 'Mejores Terceros']

interface Team {
  id: string
  name: string
  code: string
  played: number
  won: number
  draw: number
  lost: number
  gf: number
  ga: number
  points: number
  flag_emoji?: string
}

interface TeamRow {
  id: string
  name: string
  code?: string
  played?: number
  won?: number
  drawn?: number
  lost?: number
  goals_for?: number
  goals_against?: number
  points?: number
  flag_emoji?: string
}

interface GroupRow {
  group_letter: string
  teams: TeamRow[]
}

interface GroupStanding {
  group: string
  code: string
  teams: Array<{
    id: string
    name: string
    code: string
    played: number
    won: number
    draw: number
    lost: number
    gf: number
    ga: number
    points: number
    flag_emoji?: string
  }>
}

interface ThirdTeamRow {
  id: string
  name: string
  code: string
  group: string
  played: number
  won: number
  draw: number
  lost: number
  gf: number
  ga: number
  points: number
  goalDiff: number
  status: 'Clasificado' | 'Eliminado'
}

function ThirdsTable({ thirdTeams }: { thirdTeams: ThirdTeamRow[] }) {
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
            {thirdTeams.map((team, index) => {
              const isQualified = team.status === 'Clasificado'
              return (
                <tr
                  key={`${team.code}-${team.group}`}
                  className={isQualified ? 'bg-emerald-50' : 'bg-rose-50'}
                >
                  <td className="px-3 py-2 font-semibold text-slate-700">{index + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className={`fi fi-${FLAG_CODES[team.code] || 'xx'} w-10 h-10`}></span>
                      <div>
                        <div>{team.name}</div>
                        <div className="text-[10px] text-slate-400">{team.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-700 text-[10px] font-semibold text-white">
                      {team.group}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">{team.played}</td>
                  <td className="px-3 py-2 text-center">{team.won}</td>
                  <td className="px-3 py-2 text-center">{team.draw}</td>
                  <td className="px-3 py-2 text-center">{team.lost}</td>
                  <td className="px-3 py-2 text-center">{team.gf}</td>
                  <td className="px-3 py-2 text-center">{team.ga}</td>
                  <td className="px-3 py-2 text-center">{team.goalDiff}</td>
                  <td className="px-3 py-2 text-center font-semibold text-slate-800">{team.points}</td>
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

function GroupTable({
  group,
  teams,
  qualifiedThirdIds,
}: {
  group: string
  teams: Array<{
    id: string
    name: string
    code: string
    played: number
    won: number
    draw: number
    lost: number
    gf: number
    ga: number
    points: number
  }>
  qualifiedThirdIds: Set<string>
}) {
  return (
    <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs text-sky-700">
          {group.split(' ')[1]}
        </span>
        {group}
      </div>
      <div className="mt-3 rounded-lg border border-sky-100">
        <div className="grid grid-cols-[2fr_repeat(7,1fr)_1.3fr] gap-2 border-b border-sky-100 bg-sky-50 px-3 py-2 text-[11px] font-semibold uppercase text-slate-500">
          <span>Equipo</span>
          <span className="text-center">PJ</span>
          <span className="text-center">G</span>
          <span className="text-center">E</span>
          <span className="text-center">P</span>
          <span className="text-center">GF</span>
          <span className="text-center">GC</span>
          <span className="text-center">PTS</span>
          <span className="text-center">Estado</span>
        </div>
        {teams.map((team, index) => (
          <div
            key={team.id}
            className={`grid grid-cols-[2fr_repeat(7,1fr)_1.3fr] gap-2 px-3 py-2 text-xs text-slate-700 ${
              index === 0
                ? 'bg-emerald-50'
                : index === 1
                ? 'bg-sky-50'
                : index === 2
                ? 'bg-amber-50'
                : 'bg-white'
            }`}
          >
            <span className="font-semibold text-slate-800 flex items-center gap-2">
              <span className={`fi fi-${FLAG_CODES[team.code] || 'xx'} w-10 h-10`}></span>
              <div>
                <div>{team.name}</div>
                <div className="text-[10px] text-slate-400">{team.code}</div>
              </div>
            </span>
            <span className="text-center">{team.played}</span>
            <span className="text-center">{team.won}</span>
            <span className="text-center">{team.draw}</span>
            <span className="text-center">{team.lost}</span>
            <span className="text-center">{team.gf}</span>
            <span className="text-center">{team.ga}</span>
            <span className="text-center font-semibold text-slate-900">{team.points}</span>
            <span className="text-center">
              {index < 2 ? (
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                  Directo
                </span>
              ) : index === 2 && qualifiedThirdIds.has(team.id) ? (
                <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-semibold text-sky-700">
                  Mejor tercero
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                  Eliminado
                </span>
              )}
            </span>
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

  const isFinished = match.status === 'finished'
  const isPast = new Date(match.match_date) < new Date()
  const canPredict = allowPredict && !isFinished && !isPast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canPredict) return

    setLoading(true)
    setSuccess(false)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: match.id,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (error) {
      console.error('Error saving prediction:', error)
      alert('No se pudo guardar el pronóstico')
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
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.home_team] || 'xx'] || 'xx'} w-10 h-10 rounded`}></span>
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
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.away_team] || 'xx'] || 'xx'} w-10 h-10 rounded`}></span>
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
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [teams, setTeams] = useState<TeamRow[]>([])

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

  // Agrupar por grupos (A, B, C, etc.)
  const matchesByGroup = useMemo(() => {
    const groups: Record<string, Match[]> = {}
    
    matches.forEach((match) => {
      const groupLetter = TEAM_TO_GROUP[match.home_team] || 'Unknown'
      if (!groups[groupLetter]) {
        groups[groupLetter] = []
      }
      groups[groupLetter].push(match)
    })
    
    // Ordenar por grupo (A, B, C, ...)
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [key, value]) => {
        acc[key] = value.sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
        return acc
      }, {} as Record<string, Match[]>)
  }, [matches])

  const stages = activePrimary === 'group' ? groupStages : knockoutStages
  const stageEntries = Object.entries(stages)

  useEffect(() => {
    const loadGroupsAndTeams = async () => {
      const token = getToken()
      const headers = { Authorization: `Bearer ${token}` }

      try {
        const groupsRes = await fetch(`${API_URL}/api/matches/groups`, { headers })

        if (groupsRes.ok) {
          const data = await groupsRes.json()
          setGroups(data.groups || [])
        }
      } catch (err) {
        console.warn('No se pudieron cargar grupos:', err)
      }
    }

    loadGroupsAndTeams()
  }, [])

  const groupTables = useMemo<GroupStanding[]>(() => {
    // Los grupos ya vienen con sus equipos y posiciones del API
    if (!groups.length) return []

    return groups
      .filter((group: any) => {
        // Filtrar grupos válidos
        return group.group_letter && group.teams && group.teams.length > 0
      })
      .map((group: any) => {
        // Filtrar equipos válidos y mapear a la estructura esperada
        const groupTeams = (group.teams || [])
          .filter((team: any) => team && team.id && team.name)
          .map((team: any) => ({
            id: team.id,
            name: team.name,
            code: (team.code || team.name.slice(0, 3)).toUpperCase(),
            played: team.played || 0,
            won: team.won || 0,
            draw: team.drawn || 0,
            lost: team.lost || 0,
            gf: team.goals_for || 0,
            ga: team.goals_against || 0,
            points: team.points || 0,
            flag_emoji: team.flag_emoji || '',
          }))
          .sort((a: any, b: any) => {
            // Ordenar por puntos, diferencia de goles, etc
            if (b.points !== a.points) return b.points - a.points
            const goalDiffA = a.gf - a.ga
            const goalDiffB = b.gf - b.ga
            if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA
            if (b.gf !== a.gf) return b.gf - a.gf
            return a.name.localeCompare(b.name)
          })

        return {
          group: `Grupo ${group.group_letter}`,
          code: group.group_letter,
          teams: groupTeams,
        }
      })
      .sort((a: any, b: any) => a.code.localeCompare(b.code))
  }, [groups])

  const thirdTeams = useMemo<ThirdTeamRow[]>(() => {
    const ranked = groupTables
      .filter((group) => group.teams.length >= 3)
      .map((group) => {
        const third = group.teams[2]
        return {
          id: third.id,
          name: third.name,
          code: third.code,
          group: group.code,
          played: third.played,
          won: third.won,
          draw: third.draw,
          lost: third.lost,
          gf: third.gf,
          ga: third.ga,
          points: third.points,
          goalDiff: third.gf - third.ga,
          status: 'Eliminado' as const,
        }
      })
      .sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
        if (b.gf !== a.gf) return b.gf - a.gf
        if (a.ga !== b.ga) return a.ga - b.ga
        if (b.won !== a.won) return b.won - a.won
        return a.group.localeCompare(b.group)
      })

    const qualifiedSlots = Math.min(8, ranked.length)
    return ranked.map((team, index) => ({
      ...team,
      status: index < qualifiedSlots ? 'Clasificado' : 'Eliminado',
    }))
  }, [groupTables])

  const qualifiedThirdIds = useMemo(
    () => new Set(thirdTeams.filter((team) => team.status === 'Clasificado').map((team) => team.id)),
    [thirdTeams]
  )

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
          {groupTables.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {groupTables.map((group) => (
                <GroupTable
                  key={group.code}
                  group={group.group}
                  teams={group.teams}
                  qualifiedThirdIds={qualifiedThirdIds}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-sky-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-600">No hay grupos cargados todavía.</p>
            </div>
          )}
        </div>
      )}

      {showSecondaryTabs && activeSecondary === 'Mejores Terceros' && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            Clasificacion oficial de mejores terceros. Los 8 equipos mejor posicionados entre todos los terceros
            clasifican a la siguiente ronda.
          </div>
          <ThirdsTable thirdTeams={thirdTeams} />
        </div>
      )}

      {(!showSecondaryTabs || activeSecondary === 'Resultados') && activePrimary === 'group' && (
        <div className="grid gap-6">
        {Object.keys(matchesByGroup).length === 0 && (
          <div className="rounded-2xl border border-sky-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">No hay partidos disponibles.</p>
          </div>
        )}

        {Object.entries(matchesByGroup).map(([groupLetter, matchList]) => (
          <div key={groupLetter} className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Grupo {groupLetter}</h2>
            <div className="mt-4 grid gap-4">
              {matchList.map((match) => (
                <ResultRow key={match.id} match={match} userId={userId} allowPredict={allowPredict} />
              ))}
            </div>
          </div>
        ))}
      </div>
      )}

      {(!showSecondaryTabs || activeSecondary === 'Resultados') && activePrimary === 'knockout' && (
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
