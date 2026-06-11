'use client'

import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '@/lib/config'
import { getCache, setCache } from '@/lib/dataCache'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export interface Match {
  id: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  home_penalties?: number | null
  away_penalties?: number | null
  match_date: string
  stage: string
  status: 'scheduled' | 'live' | 'finished'
}

export const FLAG_CODES: Record<string, string> = {
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

export const TEAM_TO_GROUP: Record<string, string> = {
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

export const TEAM_TO_CODE: Record<string, string> = {
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
  started: boolean
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
  status: 'Clasificado' | 'Eliminado' | 'Por definir'
}

function ThirdsTable({ thirdTeams }: { thirdTeams: ThirdTeamRow[] }) {
  return (
    <div className="min-w-0 rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400">★</span>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tabla de Mejores Terceros</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Los 8 mejores terceros clasifican a la siguiente ronda (Dieciseisavos de final)
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-sky-100 dark:border-slate-700">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-sky-50 dark:bg-sky-950/40 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
          <tbody className="divide-y divide-sky-100 dark:divide-slate-700">
            {thirdTeams.map((team, index) => {
              const isQualified = team.status === 'Clasificado'
              const isPending = team.status === 'Por definir'
              return (
                <tr
                  key={`${team.code}-${team.group}`}
                  className={isPending ? 'bg-white dark:bg-slate-800' : isQualified ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-rose-50 dark:bg-rose-950/30'}
                >
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">{index + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className={`fi fi-${FLAG_CODES[team.code] || 'xx'} w-10 h-10`}></span>
                      <div>
                        <div>{team.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{team.code}</div>
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
                  <td className="px-3 py-2 text-center font-semibold text-slate-800 dark:text-slate-200">{team.points}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        isPending
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          : isQualified
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {isPending ? 'Por definir' : isQualified ? '✓ Clasificado' : '✕ Eliminado'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg bg-sky-50 dark:bg-sky-950/40 px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Criterios de Clasificacion (en orden):</p>
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
  started,
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
  started: boolean
}) {
  return (
    <div className="rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40 text-xs text-sky-700 dark:text-sky-400">
          {group.split(' ')[1]}
        </span>
        {group}
      </div>
      <div className="mt-3 rounded-lg border border-sky-100 dark:border-slate-700">
        <div className="grid grid-cols-[2fr_repeat(7,1fr)_1.8fr] gap-2 border-b border-sky-100 dark:border-slate-700 bg-sky-50 dark:bg-sky-950/40 px-3 py-2 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
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
            className={`grid grid-cols-[2fr_repeat(7,1fr)_1.8fr] gap-2 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 ${
              !started
                ? 'bg-white dark:bg-slate-800'
                : index === 0
                ? 'bg-emerald-50 dark:bg-emerald-950/30'
                : index === 1
                ? 'bg-sky-50 dark:bg-sky-950/40'
                : index === 2
                ? 'bg-amber-50 dark:bg-amber-950/30'
                : 'bg-white dark:bg-slate-800'
            }`}
          >
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className={`fi fi-${FLAG_CODES[team.code] || 'xx'} w-10 h-10`}></span>
              <div>
                <div>{team.name}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">{team.code}</div>
              </div>
            </span>
            <span className="text-center">{team.played}</span>
            <span className="text-center">{team.won}</span>
            <span className="text-center">{team.draw}</span>
            <span className="text-center">{team.lost}</span>
            <span className="text-center">{team.gf}</span>
            <span className="text-center">{team.ga}</span>
            <span className="text-center font-semibold text-slate-900 dark:text-slate-100">{team.points}</span>
            <span className="text-center">
              {!started ? (
                <span className="whitespace-nowrap rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Por definir
                </span>
              ) : index < 2 ? (
                <span className="whitespace-nowrap rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Directo
                </span>
              ) : index === 2 && qualifiedThirdIds.has(team.id) ? (
                <span className="whitespace-nowrap rounded-full bg-sky-100 dark:bg-sky-900/40 px-2 py-1 text-[10px] font-semibold text-sky-700 dark:text-sky-400">
                  Mejor tercero
                </span>
              ) : (
                <span className="whitespace-nowrap rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  Eliminado
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Clasificado directo
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          Mejor tercero
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          Eliminado
        </span>
      </div>
    </div>
  )
}


function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])

  return (
    <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 p-6 text-left"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div className="grid gap-4 px-6 pb-6">{children}</div>}
    </div>
  )
}

export function isGroupStage(stage: string) {
  const value = stage.toLowerCase()
  return value.includes('group') || value.includes('grupo')
}

export function isTBD(match: Match) {
  return match.home_team === 'Por definir' || match.away_team === 'Por definir'
}

export function formatDate(value: string) {
  return new Date(value)
    .toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(',', '')
}

function statusLabel(status: Match['status'], locked: boolean, allowPredict: boolean, tbd: boolean) {
  if (tbd) return 'Por definir'
  if (status === 'finished') return allowPredict ? 'Finalizado' : 'Resultado'
  if (status === 'live') return 'En vivo'
  if (allowPredict && locked) return 'Cerrado'
  return 'Por jugar'
}

function statusStyles(status: Match['status'], locked: boolean, allowPredict: boolean, tbd: boolean) {
  if (tbd) return 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
  if (status === 'finished') return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  if (status === 'live') return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
  if (allowPredict && locked) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
  return 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400'
}

const MAX_SCORE = 20

function ScoreStepper({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (value: number) => void
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_SCORE, value + 1))}
        disabled={value >= MAX_SCORE}
        aria-label={`Sumar gol a ${label}`}
        className="flex h-7 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:bg-slate-700 disabled:opacity-30"
      >
        +
      </button>
      <span className="flex h-9 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        aria-label={`Restar gol a ${label}`}
        className="flex h-7 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:bg-slate-700 disabled:opacity-30"
      >
        −
      </button>
    </div>
  )
}

function ResultRow({
  match,
  userId,
  allowPredict,
  prediction,
  onPredictionSaved,
  onPredictionDeleted,
  highlight = false,
}: {
  match: Match
  userId: string
  allowPredict: boolean
  prediction?: { predicted_home_score: number; predicted_away_score: number; predicted_penalty_winner?: 'home' | 'away' | null; points?: number } | null
  onPredictionSaved?: (matchId: string, prediction: { predicted_home_score: number; predicted_away_score: number; predicted_penalty_winner?: 'home' | 'away' | null }) => void
  onPredictionDeleted?: (matchId: string) => void
  highlight?: boolean
}) {
  const [homeScore, setHomeScore] = useState<number>(prediction?.predicted_home_score ?? 0)
  const [awayScore, setAwayScore] = useState<number>(prediction?.predicted_away_score ?? 0)
  const [penaltyWinner, setPenaltyWinner] = useState<'home' | 'away' | null>(prediction?.predicted_penalty_winner ?? null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setHomeScore(prediction?.predicted_home_score ?? 0)
    setAwayScore(prediction?.predicted_away_score ?? 0)
    setPenaltyWinner(prediction?.predicted_penalty_winner ?? null)
  }, [prediction])

  const isFinished = match.status === 'finished'
  const tbd = isTBD(match)
  const locked = Date.now() >= new Date(match.match_date).getTime() - 60 * 60 * 1000
  const canPredict = allowPredict && !isFinished && !locked && !tbd
  const isSaved = !!prediction
  const showPenaltyPicker = homeScore === awayScore && !isGroupStage(match.stage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canPredict || isSaved) return

    if (showPenaltyPicker && !penaltyWinner) {
      alert('Predijiste un empate: elegí el ganador de la definición por penales')
      return
    }

    const finalPenaltyWinner = showPenaltyPicker ? penaltyWinner : null

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
          predicted_penalty_winner: finalPenaltyWinner,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar')
      }

      setSuccess(true)
      onPredictionSaved?.(match.id, { predicted_home_score: homeScore, predicted_away_score: awayScore, predicted_penalty_winner: finalPenaltyWinner })
      setTimeout(() => setSuccess(false), 2500)
    } catch (error) {
      console.error('Error saving prediction:', error)
      alert('No se pudo guardar el pronóstico')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!canPredict || loading) return

    setLoading(true)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/predictions/${match.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al cancelar')
      }

      onPredictionDeleted?.(match.id)
    } catch (error) {
      console.error('Error deleting prediction:', error)
      alert('No se pudo cancelar el pronóstico')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      id={`match-${match.id}`}
      onSubmit={handleSubmit}
      className={`rounded-xl border bg-white dark:bg-slate-800 p-4 shadow-sm transition ${
        highlight ? 'border-sky-400 ring-2 ring-sky-300 dark:ring-sky-600' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.home_team] || 'xx'] || 'xx'} w-10 h-10 rounded`}></span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{match.home_team}</p>
            {isFinished && match.home_score !== null && (
              <p className="text-lg font-semibold text-sky-700 dark:text-sky-400">{match.home_score}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          {tbd ? (
            <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Por definir
            </span>
          ) : canPredict ? (
            isSaved ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span className="h-9 w-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-center leading-9">
                    {homeScore}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">vs</span>
                  <span className="h-9 w-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-center leading-9">
                    {awayScore}
                  </span>
                </div>
                {prediction?.predicted_penalty_winner && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Penales: {prediction.predicted_penalty_winner === 'home' ? match.home_team : match.away_team}
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <ScoreStepper value={homeScore} onChange={setHomeScore} label={match.home_team} />
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">vs</span>
                  <ScoreStepper value={awayScore} onChange={setAwayScore} label={match.away_team} />
                </div>
                {showPenaltyPicker && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">¿Quién gana en penales?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPenaltyWinner('home')}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                          penaltyWinner === 'home' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-600'
                        }`}
                      >
                        {match.home_team}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPenaltyWinner('away')}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                          penaltyWinner === 'away' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-600'
                        }`}
                      >
                        {match.away_team}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <span className="h-9 w-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-center leading-9">
                  {prediction ? prediction.predicted_home_score : match.home_score ?? '-'}
                </span>
                <span className="text-slate-400 dark:text-slate-500">vs</span>
                <span className="h-9 w-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-center leading-9">
                  {prediction ? prediction.predicted_away_score : match.away_score ?? '-'}
                </span>
              </div>
              {prediction && (
                <span className="text-[10px] text-slate-700 dark:text-slate-300">
                  Tu pronóstico
                  {prediction.predicted_penalty_winner
                    ? ` (penales: ${prediction.predicted_penalty_winner === 'home' ? match.home_team : match.away_team})`
                    : ''}
                  {isFinished && prediction.points !== undefined ? ` · ${prediction.points} pts` : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{match.away_team}</p>
            {isFinished && match.away_score !== null && (
              <p className="text-lg font-semibold text-sky-700 dark:text-sky-400">{match.away_score}</p>
            )}
          </div>
          <span className={`fi fi-${FLAG_CODES[TEAM_TO_CODE[match.away_team] || 'xx'] || 'xx'} w-10 h-10 rounded`}></span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-700 pt-3 text-xs text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
        <span>
          {formatDate(match.match_date)}
          {isFinished && match.home_penalties != null && match.away_penalties != null && (
            <span className="ml-2 font-semibold text-slate-600 dark:text-slate-400">
              · Penales {match.home_penalties}-{match.away_penalties}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 font-semibold ${statusStyles(match.status, locked, allowPredict, tbd)}`}>
            {statusLabel(match.status, locked, allowPredict, tbd)}
          </span>
          {allowPredict && locked && !isFinished && !tbd && (
            <span className="text-slate-400 dark:text-slate-500">Las predicciones cierran 1h antes del partido</span>
          )}
          {canPredict && (
            isSaved ? (
              <>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Guardado
                </span>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:bg-slate-800/60 disabled:opacity-50"
                >
                  {loading ? 'Cancelando...' : 'Cancelar'}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-sky-600 px-4 py-1 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            )
          )}
          {success && <span className="text-sky-700 dark:text-sky-400">Pronostico guardado</span>}
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
  highlightMatchId = null,
}: {
  matches: Match[]
  userId: string
  allowPredict?: boolean
  showSecondaryTabs?: boolean
  title?: string
  description?: string
  highlightMatchId?: string | null
}) {
  const [activePrimary, setActivePrimary] = useState<'group' | 'knockout'>('group')
  const [activeSecondary, setActiveSecondary] = useState('Resultados')
  const [groups, setGroups] = useState<GroupRow[]>(() => getCache<GroupRow[]>('groups') || [])
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [predictions, setPredictions] = useState<Record<string, { predicted_home_score: number; predicted_away_score: number; predicted_penalty_winner?: 'home' | 'away' | null; points?: number }>>(() => getCache('predictions') || {})
  const [predictionsLoaded, setPredictionsLoaded] = useState(!allowPredict || !!getCache('predictions'))

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
      if (!isGroupStage(match.stage)) return
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

  // Si llegamos con un partido para destacar, nos posicionamos en la pestaña
  // (grupos/eliminatorias) que le corresponde.
  useEffect(() => {
    if (!highlightMatchId) return
    const match = matches.find((m) => m.id === highlightMatchId)
    if (!match) return
    setActivePrimary(isGroupStage(match.stage) ? 'group' : 'knockout')
    setActiveSecondary('Resultados')
  }, [highlightMatchId, matches])

  // Hacemos scroll hasta el partido destacado una vez que su sección esté abierta.
  useEffect(() => {
    if (!highlightMatchId) return
    const timer = setTimeout(() => {
      document.getElementById(`match-${highlightMatchId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
    return () => clearTimeout(timer)
  }, [highlightMatchId, activePrimary, matches])

  useEffect(() => {
    if (!allowPredict) return

    const loadPredictions = async () => {
      const token = getToken()

      try {
        const res = await fetch(`${API_URL}/api/predictions`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          const map: Record<string, { predicted_home_score: number; predicted_away_score: number; predicted_penalty_winner?: 'home' | 'away' | null; points?: number }> = {}
          for (const p of data.predictions || []) {
            map[p.match_id] = {
              predicted_home_score: p.predicted_home_score,
              predicted_away_score: p.predicted_away_score,
              predicted_penalty_winner: p.predicted_penalty_winner,
              points: p.points,
            }
          }
          setCache('predictions', map)
          setPredictions(map)
        }
      } catch (err) {
        console.warn('No se pudieron cargar las predicciones:', err)
      } finally {
        setPredictionsLoaded(true)
      }
    }

    loadPredictions()
  }, [allowPredict])

  const handlePredictionSaved = (matchId: string, prediction: { predicted_home_score: number; predicted_away_score: number; predicted_penalty_winner?: 'home' | 'away' | null }) => {
    setPredictions((prev) => {
      const next = { ...prev, [matchId]: prediction }
      setCache('predictions', next)
      return next
    })
  }

  const handlePredictionDeleted = (matchId: string) => {
    setPredictions((prev) => {
      const next = { ...prev }
      delete next[matchId]
      setCache('predictions', next)
      return next
    })
  }

  useEffect(() => {
    if (!showSecondaryTabs) return

    const loadGroupsAndTeams = async () => {
      const token = getToken()
      const headers = { Authorization: `Bearer ${token}` }

      try {
        const groupsRes = await fetch(`${API_URL}/api/matches/groups`, { headers })

        if (groupsRes.ok) {
          const data = await groupsRes.json()
          setCache('groups', data.groups || [])
          setGroups(data.groups || [])
        }
      } catch (err) {
        console.warn('No se pudieron cargar grupos:', err)
      }
    }

    loadGroupsAndTeams()
  }, [showSecondaryTabs])

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
          started: groupTeams.some((team: any) => team.played > 0),
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

    const anyMatchPlayed = groupTables.some((group) => group.started)
    const qualifiedSlots = Math.min(8, ranked.length)
    return ranked.map((team, index) => ({
      ...team,
      status: !anyMatchPlayed ? 'Por definir' : index < qualifiedSlots ? 'Clasificado' : 'Eliminado',
    }))
  }, [groupTables])

  const qualifiedThirdIds = useMemo(
    () => new Set(thirdTeams.filter((team) => team.status === 'Clasificado').map((team) => team.id)),
    [thirdTeams]
  )

  return (
    <div className="grid min-w-0 gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {(Object.keys(PRIMARY_TAB_LABELS) as Array<'group' | 'knockout'>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActivePrimary(key)
                setActiveSecondary('Resultados')
              }}
              className={`border-b-2 pb-3 transition ${
                activePrimary === key ? 'border-sky-600 text-sky-700 dark:text-sky-400' : 'border-transparent'
              }`}
            >
              {PRIMARY_TAB_LABELS[key]}
            </button>
          ))}
        </div>
        {showSecondaryTabs && activePrimary === 'group' && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {SECONDARY_TABS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveSecondary(label)}
                className={`rounded-full px-3 py-1 ${
                  activeSecondary === label
                    ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showSecondaryTabs && activePrimary === 'group' && activeSecondary === 'Tablas de Posiciones' && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-400">
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
                  started={group.started}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm">
              <p className="text-slate-600 dark:text-slate-400">No hay grupos cargados todavía.</p>
            </div>
          )}
        </div>
      )}

      {showSecondaryTabs && activePrimary === 'group' && activeSecondary === 'Mejores Terceros' && (
        <div className="grid min-w-0 gap-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-400">
            Clasificacion oficial de mejores terceros. Los 8 equipos mejor posicionados entre todos los terceros
            clasifican a la siguiente ronda.
          </div>
          <ThirdsTable thirdTeams={thirdTeams} />
        </div>
      )}

      {(!showSecondaryTabs || activeSecondary === 'Resultados') && activePrimary === 'group' && allowPredict && !predictionsLoaded && (
        <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">Cargando tus pronósticos...</p>
        </div>
      )}

      {(!showSecondaryTabs || activeSecondary === 'Resultados') && activePrimary === 'group' && (!allowPredict || predictionsLoaded) && (
        <div className="grid gap-6">
        {Object.keys(matchesByGroup).length === 0 && (
          <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm">
            <p className="text-slate-600 dark:text-slate-400">No hay partidos disponibles.</p>
          </div>
        )}

        {Object.entries(matchesByGroup).map(([groupLetter, matchList]) => (
          <CollapsibleSection
            key={groupLetter}
            title={`Grupo ${groupLetter}`}
            defaultOpen={matchList.some((match) => match.id === highlightMatchId)}
          >
            {matchList.map((match) => (
              <ResultRow
                key={match.id}
                match={match}
                userId={userId}
                allowPredict={allowPredict}
                prediction={predictions[match.id]}
                onPredictionSaved={handlePredictionSaved}
                onPredictionDeleted={handlePredictionDeleted}
                highlight={match.id === highlightMatchId}
              />
            ))}
          </CollapsibleSection>
        ))}
      </div>
      )}

      {(!showSecondaryTabs || activeSecondary === 'Resultados') && activePrimary === 'knockout' && allowPredict && !predictionsLoaded && (
        <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">Cargando tus pronósticos...</p>
        </div>
      )}

      {(!showSecondaryTabs || activeSecondary === 'Resultados') && activePrimary === 'knockout' && (!allowPredict || predictionsLoaded) && (
        <div className="grid gap-6">
        {stageEntries.length === 0 && (
          <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm">
            <p className="text-slate-600 dark:text-slate-400">No hay partidos disponibles.</p>
          </div>
        )}

        {stageEntries.map(([stage, list]) => (
          <CollapsibleSection
            key={stage}
            title={stage}
            defaultOpen={list.some((match) => match.id === highlightMatchId)}
          >
            {list.map((match) => (
              <ResultRow
                key={match.id}
                match={match}
                userId={userId}
                allowPredict={allowPredict}
                prediction={predictions[match.id]}
                onPredictionSaved={handlePredictionSaved}
                onPredictionDeleted={handlePredictionDeleted}
                highlight={match.id === highlightMatchId}
              />
            ))}
          </CollapsibleSection>
        ))}
      </div>
      )}
    </div>
  )
}
