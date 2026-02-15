import { Lora, Oswald } from 'next/font/google'
import PublicNav from '@/components/ui/PublicNav'

const headingFont = Oswald({ subsets: ['latin'], weight: ['400', '600'] })
const bodyFont = Lora({ subsets: ['latin'], weight: ['400', '500', '600'] })

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
  'Real: Mexico 2-0 | Tu pronostico: Mexico 2-0 -> 3 pts',
  'Real: Mexico 2-0 | Tu pronostico: Mexico 1-0 -> 2 pts',
  'Real: Mexico 2-0 | Tu pronostico: Empate 1-1 -> 0 pts',
]

const knockoutScoring = [
  { label: 'Dieciseisavos de Final (16 equipos)', points: '2 pts por equipo' },
  { label: 'Octavos de Final (8 equipos)', points: '4 pts por equipo' },
  { label: 'Cuartos de Final (4 equipos)', points: '6 pts por equipo' },
  { label: 'Semifinales (2 equipos)', points: '8 pts por equipo' },
  { label: 'Finalistas (2 equipos)', points: '10 pts por equipo' },
  { label: 'Campeon del Mundial', points: '+10 pts bonus adicional' },
]

const maxPoints = [
  { label: 'Fase de Grupos', points: '216', detail: '61.7% del total' },
  { label: 'Fase Eliminatoria', points: '134', detail: '38.3% del total' },
  { label: 'Puntos Maximos Totales', points: '350', detail: 'Total posible' },
]

const importantRules = [
  {
    title: 'Plazos de Pronosticos',
    text: 'Todos los pronosticos deben estar registrados antes del inicio de cada partido. No se aceptan cambios una vez iniciado.',
  },
  {
    title: 'Pronosticos Incompletos',
    text: 'Si no completas pronosticos para algun partido: 0 puntos para esos partidos. No hay penalizacion adicional.',
  },
  {
    title: 'Fase Eliminatoria',
    text: 'Solo importa que equipo avanza, no el resultado del partido. Si un equipo gana en penales, cuenta como clasificado.',
  },
  {
    title: 'Partido Tercer Puesto',
    text: 'El partido por el tercer puesto NO otorga puntos en este sistema.',
  },
]

const tips = [
  'Usa las sugerencias IA (icono ✨) para obtener predicciones basadas en el nivel de los equipos.',
  'Usa "Llenar Aleatorio" para completar rapidamente un grupo y luego ajusta tus predicciones.',
  'Revisa el Ranking regularmente para ver como te compara con otros participantes.',
  'Completa tus predicciones temprano para evitar perder partidos.',
  'No descuides las eliminatorias - representan el 38% de los puntos totales.',
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

      <PublicNav linkClassName={bodyFont.className} />

      <main className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-10">
        <section className="rounded-3xl border border-sky-200/60 bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-8 shadow-lg">
          <p className={`text-sm uppercase tracking-[0.3em] text-sky-700 ${bodyFont.className}`}>
            Reglas del Juego
          </p>
          <h1 className={`mt-3 text-4xl md:text-5xl font-semibold text-slate-900 ${headingFont.className}`}>
            Prode Mundial 2026
          </h1>
          <p className={`mt-4 max-w-2xl text-lg text-slate-700 ${bodyFont.className}`}>
            Sistema de puntuacion y reglas del Prode Mundial 2026.
          </p>
        </section>

        <section className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
          <h2 className={`text-2xl font-semibold text-slate-900 ${headingFont.className}`}>
            ¡Bienvenido al Prode Mundial 2026!
          </h2>
          <p className={`mt-3 text-sm text-slate-600 ${bodyFont.className}`}>
            Predice los resultados y compite por el primer lugar.
          </p>
          <p className={`mt-4 text-sm text-slate-700 ${bodyFont.className}`}>
            Participa en el juego de pronosticos mas emocionante del Mundial 2026. Predice los resultados de los
            partidos y que equipos avanzan en cada fase. ¡Acumula puntos y corona te campeon del Prode!
          </p>
        </section>

        <section className="grid gap-6">
          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h2 className={`text-2xl font-semibold text-slate-900 ${headingFont.className}`}>
              Sistema de Puntuacion
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                <p className={`text-sm font-semibold text-slate-900 ${headingFont.className}`}>
                  Fase de Grupos (72 partidos)
                </p>
                <div className="mt-3 grid gap-3">
                  {groupScoring.map((row) => (
                    <div key={row.label} className="rounded-lg bg-white/80 px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className={`text-sm font-semibold text-slate-900 ${bodyFont.className}`}>
                          {row.label}
                        </p>
                        <span className="rounded-full bg-sky-700 px-3 py-1 text-xs font-semibold text-white">
                          {row.points}
                        </span>
                      </div>
                      <p className={`mt-2 text-xs text-slate-600 ${bodyFont.className}`}>
                        {row.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p className={`mt-3 text-xs text-slate-700 ${bodyFont.className}`}>
                  Maximo por partido: 3 puntos
                </p>
                <p className={`text-xs text-slate-700 ${bodyFont.className}`}>
                  Total posible en fase de grupos: 216 puntos
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className={`text-sm font-semibold text-slate-900 ${headingFont.className}`}>
                  📊 Ejemplos de Puntuacion
                </p>
                <ul className={`mt-3 grid gap-2 text-xs text-slate-700 ${bodyFont.className}`}>
                  {scoringExamples.map((example) => (
                    <li key={example} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h3 className={`text-xl font-semibold text-slate-900 ${headingFont.className}`}>
              🏆 Fase Eliminatoria
            </h3>
            <p className={`mt-2 text-sm text-slate-600 ${bodyFont.className}`}>
              En las eliminatorias, los puntos se otorgan por acertar que equipos clasifican a la siguiente ronda (no
              importa el resultado especifico del partido).
            </p>
            <div className="mt-4 grid gap-3">
              {knockoutScoring.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <span className={`text-sm text-slate-800 ${bodyFont.className}`}>
                    {row.label}
                  </span>
                  <span className="rounded-full bg-sky-700 px-3 py-1 text-xs font-semibold text-white">
                    {row.points}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
              <p className={`text-xs text-sky-800 ${bodyFont.className}`}>
                💡 Nota: Si aciertas al campeon, obtienes 10 pts por finalista + 10 pts por campeon = 20 puntos
                totales por ese equipo.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {maxPoints.map((item) => (
            <div key={item.label} className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
              <p className={`text-sm text-slate-500 ${bodyFont.className}`}>
                {item.label}
              </p>
              <p className={`mt-2 text-3xl font-semibold text-slate-900 ${headingFont.className}`}>
                {item.points}
              </p>
              <p className={`mt-1 text-xs text-slate-500 ${bodyFont.className}`}>
                {item.detail}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h3 className={`text-xl font-semibold text-slate-900 ${headingFont.className}`}>
              Reglas Importantes
            </h3>
            <div className="mt-4 grid gap-3">
              {importantRules.map((rule) => (
                <div key={rule.title} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                  <p className={`text-sm font-semibold text-slate-900 ${bodyFont.className}`}>
                    {rule.title}
                  </p>
                  <p className={`mt-1 text-xs text-slate-600 ${bodyFont.className}`}>
                    {rule.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
            <h3 className={`text-xl font-semibold text-slate-900 ${headingFont.className}`}>
              Consejos para Ganar
            </h3>
            <ul className={`mt-4 grid gap-2 text-xs text-slate-700 ${bodyFont.className}`}>
              {tips.map((tip) => (
                <li key={tip} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
