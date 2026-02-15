import Link from 'next/link'

const groupScoring = [
  {
    label: 'Acertar resultado',
    points: '2 puntos',
    detail: 'Por predecir correctamente victoria local, visitante o empate.',
  },
  {
    label: 'Bonus por resultado exacto',
    points: '+1 punto',
    detail: 'Puntos adicionales si aciertas el marcador exacto (ej: 2-1).',
  },
]

const scoringExamples = [
  'Real: México 2-0 | Tu pronóstico: México 2-0 → 3 pts ✓',
  'Real: México 2-0 | Tu pronóstico: México 1-0 → 2 pts',
  'Real: México 2-0 | Tu pronóstico: Empate 1-1 → 0 pts ✗',
]

const knockoutScoring = [
  { label: 'Dieciseisavos de Final (16 equipos)', points: '2 pts por equipo' },
  { label: 'Octavos de Final (8 equipos)', points: '4 pts por equipo' },
  { label: 'Cuartos de Final (4 equipos)', points: '6 pts por equipo' },
  { label: 'Semifinales (2 equipos)', points: '8 pts por equipo' },
  { label: 'Finalistas (2 equipos)', points: '10 pts por equipo' },
  { label: 'Campeón del Mundial', points: '+10 pts bonus adicional' },
]

const maxPoints = [
  { label: 'Fase de Grupos', points: '216', detail: '61.7% del total' },
  { label: 'Fase Eliminatoria', points: '134', detail: '38.3% del total' },
  { label: 'Puntos Máximos Totales', points: '350', detail: 'Total posible' },
]

const importantRules = [
  {
    title: 'Plazos de Pronósticos',
    text: 'Todos los pronósticos deben estar registrados antes del inicio de cada partido. No se aceptan cambios una vez iniciado.',
  },
  {
    title: 'Pronósticos Incompletos',
    text: 'Si no completas pronósticos para algún partido: 0 puntos para esos partidos. No hay penalización adicional.',
  },
  {
    title: 'Fase Eliminatoria',
    text: 'Solo importa qué equipo avanza, no el resultado del partido. Si un equipo gana en penales, cuenta como clasificado.',
  },
  {
    title: 'Partido Tercer Puesto',
    text: 'El partido por el tercer puesto NO otorga puntos en este sistema.',
  },
]

const tips = [
  'Usa las sugerencias IA (icono ✨) para obtener predicciones basadas en el nivel de los equipos.',
  'Usa "Llenar Aleatorio" para completar rápidamente un grupo y luego ajusta tus predicciones.',
  'Revisa el Ranking regularmente para ver cómo te compara con otros participantes.',
  'Completa tus predicciones temprano para evitar perder partidos.',
  'No descuides las eliminatorias - representan el 38% de los puntos totales.',
]

export default function RulesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

      <section className="relative z-10 mx-auto grid max-w-6xl gap-6 px-4 py-8">
        <div className="rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-700">
            Reglas del Juego
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Prode Mundial 2026
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
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
              className="rounded-full border border-sky-300 px-4 py-2 text-xs font-semibold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-50"
            >
              Ranking
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            ¡Bienvenido al Prode Mundial 2026!
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Predice los resultados y compite por el primer lugar.
          </p>
          <p className="mt-4 text-sm text-slate-700">
            Participa en el juego de pronósticos más emocionante del Mundial 2026. Predice los resultados de los
            partidos y qué equipos avanzan en cada fase. ¡Acumula puntos y corona te campeón del Prode!
          </p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Sistema de Puntuación
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Fase de Grupos (72 partidos)
                </p>
                <div className="mt-3 grid gap-3">
                  {groupScoring.map((row) => (
                    <div key={row.label} className="rounded-lg border border-sky-100 bg-white px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {row.label}
                        </p>
                        <span className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white">
                          {row.points}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        {row.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-700">
                  Máximo por partido: 3 puntos
                </p>
                <p className="text-xs text-slate-700">
                  Total posible en fase de grupos: 216 puntos
                </p>
              </div>

              <div className="rounded-xl border border-sky-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  📊 Ejemplos de Puntuación
                </p>
                <ul className="mt-3 grid gap-2 text-xs text-slate-700">
                  {scoringExamples.map((example) => (
                    <li key={example} className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              🏆 Fase Eliminatoria
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              En las eliminatorias, los puntos se otorgan por acertar qué equipos clasifican a la siguiente ronda (no
              importa el resultado específico del partido).
            </p>
            <div className="mt-4 grid gap-3">
              {knockoutScoring.map((row) => (
                <div key={row.label} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                  <span className="text-sm text-slate-800">
                    {row.label}
                  </span>
                  <span className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white">
                    {row.points}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
              <p className="text-xs text-slate-600">
                💡 Nota: Si aciertas al campeón, obtienes 10 pts por finalista + 10 pts por campeón = 20 puntos
                totales por ese equipo.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {maxPoints.map((item) => (
            <div key={item.label} className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {item.points}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Reglas Importantes
            </h3>
            <div className="mt-4 grid gap-3">
              {importantRules.map((rule) => (
                <div key={rule.title} className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {rule.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {rule.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Consejos para Ganar
            </h3>
            <ul className="mt-4 grid gap-2 text-xs text-slate-700">
              {tips.map((tip) => (
                <li key={tip} className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-700 p-6 text-white shadow-lg">
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
              className="w-fit rounded-full bg-white px-5 py-2 text-sm font-semibold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-50"
            >
              Ver partidos
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
