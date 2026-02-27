'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PublicNav({ linkClassName }: { linkClassName?: string }) {
  const pathname = usePathname()

  const resolveClassName = (href: string) => {
    const base = linkClassName ? `${linkClassName} ` : ''
    return pathname === href
      ? `${base}text-sky-800`
      : `${base}text-slate-700 hover:text-sky-700`
  }

  return (
    <nav className="relative z-10 border-b border-sky-200/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <button type="button" className="flex items-center gap-2 text-lg font-semibold text-sky-700">
          <span className="text-xl">⚽</span>
          Prode 2026
        </button>
        <div className="hidden items-center gap-5 text-sm font-semibold md:flex">
          <Link href="/" className={resolveClassName('/')}>Reglas del Juego</Link>
          <Link href="/matches" className={resolveClassName('/matches')}>Resultados</Link>
          <Link href="/predictions" className={resolveClassName('/predictions')}>Tus Predicciones</Link>
          <Link href="/ranking" className={resolveClassName('/ranking')}>Ranking</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="rounded-full border border-sky-300 px-4 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
          >
            Ingresar
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            Registrate
          </Link>
        </div>
      </div>
    </nav>
  )
}
