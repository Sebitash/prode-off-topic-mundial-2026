'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import DashboardNav from '@/components/ui/DashboardNav'

const groupScoring = [
  {
    label: 'Acertar el ganador',
    points: '2 puntos',
    detail: 'Por predecir correctamente quién gana el partido (o el empate). Si el partido se define por penales, cuenta como "ganador" el equipo que se queda con la serie de penales.',
  },
  {
    label: 'Bonus por resultado exacto',
    points: '+1 punto',
    detail: 'Punto adicional si además acertás el marcador exacto del partido (ej: 2-1).',
  },
]

const knockoutScoring = [
  {
    label: 'Acertar el ganador',
    points: '3 puntos',
    detail: 'Por predecir correctamente quién gana el partido (o el empate). Si el partido se define por penales, cuenta como "ganador" el equipo que se queda con la serie de penales.',
  },
  {
    label: 'Bonus por resultado exacto',
    points: '+2 puntos',
    detail: 'Puntos adicionales si además acertás el marcador exacto del partido (ej: 2-1).',
  },
  {
    label: 'Bonus por marcador de un equipo (nuevo)',
    points: '+1 punto',
    detail: 'Punto adicional si acertás el marcador final de UNO de los dos equipos (ej: predijiste 2-1 y el resultado real fue 2-0, acertaste el "2" del local). No se suma si ya acertaste el resultado exacto completo.',
  },
]

const scoringExamples = [
  'Real: México 2-0 | Tu pronóstico: México 2-0 → 3 pts ✓',
  'Real: México 2-0 | Tu pronóstico: México 1-0 → 2 pts',
  'Real: México 2-0 | Tu pronóstico: Empate 1-1 → 0 pts ✗',
]

const knockoutScoringExamples = [
  'Real: Argentina 1-1 (gana penales) | Tu pronóstico: Argentina 1-1 (gana penales) → 5 pts ✓',
  'Real: Argentina 1-1 (gana penales) | Tu pronóstico: Argentina gana 2-0 → 3 pts (acertaste el ganador, pero no el 1-1)',
  'Real: Brasil 2-1 | Tu pronóstico: Brasil 2-0 → 4 pts (ganador +3 y marcador del local "2" +1)',
  'Real: Sudáfrica 0-1 Canadá | Tu pronóstico: Sudáfrica 2-1 Canadá → 1 pt (te equivocaste de ganador, pero acertaste el "1" de Canadá)',
  'Real: Argentina 1-1 (gana penales) | Tu pronóstico: Brasil gana → 0 pts ✗',
]

const maxPoints = [
  { label: 'Fase de Grupos', points: '216', detail: '57.4% del total' },
  { label: 'Fase Eliminatoria', points: '160', detail: '42.6% del total' },
  { label: 'Puntos Máximos Totales', points: '376', detail: 'Total posible' },
]

const importantRules = [
  {
    title: 'Puntaje por Partido',
    text: 'En fase de grupos: 2 puntos por acertar el ganador, +1 punto extra si además acertás el resultado exacto (máximo 3 pts). En fase eliminatoria: 3 puntos por acertar el ganador, +2 puntos extra si además acertás el resultado exacto (máximo 5 pts), y +1 punto extra si acertás el marcador final de uno de los dos equipos (este bonus no se acumula con el de resultado exacto). Si el partido termina empatado y se define por penales, el ganador de la definición por penales es el "ganador" del partido a los efectos de estos puntos, y el resultado exacto que vale el bonus es el marcador del tiempo reglamentario (el empate, ej: 1-1), no el resultado de los penales.',
  },
  {
    title: 'Nueva Regla en Eliminatorias: Bonus de Marcador',
    text: 'A partir de la fase eliminatoria (incluye el partido por el tercer puesto), si tu pronóstico acierta el marcador final de UNO de los dos equipos (por ejemplo, predijiste 2-1 y el resultado real fue 2-0: acertaste el "2" del local), sumás +1 punto extra. Este bonus no se suma si ya acertaste el resultado exacto completo, ya que ese caso suma el bonus de +2.',
  },
  {
    title: 'Pronóstico de Penales en Eliminatorias',
    text: 'Si en un partido de eliminatorias predecís un empate (ej: 1-1), vas a tener que elegir además quién pensás que gana la definición por penales. Si el partido real también termina empatado en los 90\' y se define por penales, ese pronóstico cuenta como tu "ganador" a los efectos del puntaje (3 pts).',
  },
  {
    title: 'Plazos de Pronósticos',
    text: 'Las predicciones de cada partido se cierran 1 hora antes de su inicio. Pasado ese momento no se aceptan cambios.',
  },
  {
    title: 'Pronósticos Incompletos',
    text: 'Si no completas pronósticos para algún partido: 0 puntos para esos partidos. No hay penalización adicional.',
  },
  {
    title: 'Partidos "Por Definir"',
    text: 'Los cruces de la fase eliminatoria se completan a medida que se conocen los clasificados de cada llave. Mientras el cruce figure como "Por definir" todavía no se puede cargar un pronóstico para ese partido.',
  },
  {
    title: 'Partido por el Tercer Puesto',
    text: 'Suma puntos igual que cualquier otro partido de eliminatorias: 3 puntos por acertar el ganador, +2 por el resultado exacto.',
  },
  {
    title: 'Desempate',
    text: 'Si dos o más participantes terminan con el mismo puntaje total, se ordena primero a quien haya acertado más marcadores exactos (resultado justo, ej: 2-1 = 2-1). Si persiste el empate, se ordena por quien haya acertado más veces el marcador de un solo equipo (bonus de eliminatorias). Si aún persiste el empate, se ordena por la cantidad total de pronósticos realizados.',
  },
]

export default function RulesPage() {
  const [displayName, setDisplayName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          setDisplayName(`${user.nombre} ${user.apellido}`)
          setIsAdmin(!!user.is_admin)
        } catch (e) {
          console.error('Error parsing user data')
        }
      }
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardNav displayName={displayName} isAdmin={isAdmin} />
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

        <section className="relative z-10 mx-auto grid max-w-6xl gap-6 px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:text-sky-400 font-semibold text-sm flex items-center gap-1">
            ← Volver al Dashboard
          </Link>
        </div>
        <div className="rounded-2xl border border-sky-200/60 dark:border-slate-700 bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-700 dark:text-sky-400">
            Reglas del Juego
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Prode Mundial 2026
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Sistema de puntuación y reglas del Prode Mundial 2026.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/predictions"
              className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-700"
            >
              Tus Predicciones
            </Link>
            <Link
              href="/ranking"
              className="rounded-full border border-sky-300 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-sky-700 dark:text-sky-400 transition hover:-translate-y-0.5 hover:bg-sky-50 dark:bg-sky-950/40"
            >
              Ranking
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            ¡Bienvenido al Prode Mundial 2026!
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Predecí los resultados y competí por el primer lugar.
          </p>
          <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
            Participa en el juego de pronósticos más emocionante del Mundial 2026. Predecí los resultados de los
            partidos y qué equipos avanzan en cada fase. ¡Acumulá puntos y coronate campeón del Prode!
          </p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Sistema de Puntuación
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-xl border border-sky-200 dark:border-slate-700 bg-sky-50 dark:bg-sky-950/40 p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Fase de Grupos (72 partidos)
                </p>
                <div className="mt-3 grid gap-3">
                  {groupScoring.map((row) => (
                    <div key={row.label} className="rounded-lg border border-sky-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {row.label}
                        </p>
                        <span className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white">
                          {row.points}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        {row.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">
                  Máximo por partido: 3 puntos
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Total posible en fase de grupos: 216 puntos
                </p>
              </div>

              <div className="rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  📊 Ejemplos de Puntuación
                </p>
                <ul className="mt-3 grid gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {scoringExamples.map((example) => (
                    <li key={example} className="rounded-lg border border-sky-100 dark:border-slate-700 bg-sky-50 dark:bg-sky-950/40 px-3 py-2">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              🏆 Fase Eliminatoria (32 partidos)
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Sistema de puntos reforzado respecto a la fase de grupos: 3 puntos por acertar el ganador, +2 puntos
              extra por el resultado exacto, y +1 punto extra (nuevo) si acertás el marcador final de uno de los dos
              equipos.
            </p>
            <div className="mt-4 grid gap-3">
              {knockoutScoring.map((row) => (
                <div key={row.label} className="rounded-lg border border-sky-100 dark:border-slate-700 bg-sky-50 dark:bg-sky-950/40 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {row.label}
                    </p>
                    <span className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white">
                      {row.points}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {row.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-sky-200 dark:border-slate-700 bg-sky-50 dark:bg-sky-950/40 px-4 py-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ⚽ Si el partido se define por penales: el ganador de la serie de penales cuenta como "ganador" del
                partido (3 pts), y el resultado exacto que vale el bonus de +2 es el marcador del tiempo
                reglamentario, es decir, el empate (ej: 1-1), no el resultado de los penales.
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                📊 Ejemplos de Puntuación
              </p>
              <ul className="mt-3 grid gap-2 text-xs text-slate-700 dark:text-slate-300">
                {knockoutScoringExamples.map((example) => (
                  <li key={example} className="rounded-lg border border-sky-100 dark:border-slate-700 bg-sky-50 dark:bg-sky-950/40 px-3 py-2">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">
              Máximo por partido: 5 puntos
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Total posible en fase eliminatoria: 160 puntos
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {maxPoints.map((item) => (
            <div key={item.label} className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {item.points}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Reglas Importantes
          </h3>
          <div className="mt-4 grid gap-3">
            {importantRules.map((rule) => (
              <div key={rule.title} className="rounded-lg border border-sky-100 dark:border-slate-700 bg-sky-50 dark:bg-sky-950/40 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {rule.title}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {rule.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-sky-700 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                ¿Listo para jugar?
              </h2>
              <p className="mt-2 text-sm text-sky-100">
                Completa tus pronósticos y sube en el ranking.
              </p>
            </div>
            <Link
              href="/matches"
              className="w-fit rounded-full bg-white dark:bg-slate-800 px-5 py-2 text-sm font-semibold text-sky-700 dark:text-sky-400 transition hover:-translate-y-0.5 hover:bg-sky-50 dark:bg-sky-950/40"
            >
              Ver partidos
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500">Creado por Juan Sebastian Makkos · Sin fines de lucro</p>
      </section>
      </div>
    </div>
  )
}
