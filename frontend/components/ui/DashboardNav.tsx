'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardNav({ displayName, isAdmin = false }: { displayName: string; isAdmin?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const linkClassName = (href: string) =>
    pathname === href
      ? 'text-sky-800'
      : 'text-slate-700 hover:text-sky-700'

  const mobileLinkClassName = (href: string) =>
    `rounded-lg px-3 py-2 ${pathname === href ? 'bg-sky-50 text-sky-800' : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'}`

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; max-age=0'
    router.replace('/auth/login')
  }

  const handleLogoClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMenuOpen((value) => !value)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <nav className="border-b border-sky-200/60 bg-white/80 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-sky-700 transition hover:text-sky-800"
          >
            <span className="text-xl">⚽</span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-base font-semibold">Prode 2026</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">
                FIFA World Cup
              </span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 text-sky-600 transition-transform md:hidden ${menuOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div className="hidden md:flex space-x-4 text-sm font-semibold">
            <Link href="/dashboard" className={linkClassName('/dashboard')}>
              Inicio
            </Link>
            <Link href="/rules" className={linkClassName('/rules')}>
              Reglas del Juego
            </Link>
            <Link href="/matches" className={linkClassName('/matches')}>
              Resultados
            </Link>
            <Link href="/predictions" className={linkClassName('/predictions')}>
              Tus Predicciones
            </Link>
            <Link href="/ranking" className={linkClassName('/ranking')}>
              Ranking
            </Link>
            {isAdmin && (
              <Link href="/admin" className={linkClassName('/admin')}>
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 md:inline">
            {displayName}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            Logout
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-sky-200/60 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm font-semibold">
            <Link href="/dashboard" className={mobileLinkClassName('/dashboard')}>
              Inicio
            </Link>
            <Link href="/rules" className={mobileLinkClassName('/rules')}>
              Reglas del Juego
            </Link>
            <Link href="/matches" className={mobileLinkClassName('/matches')}>
              Resultados
            </Link>
            <Link href="/predictions" className={mobileLinkClassName('/predictions')}>
              Tus Predicciones
            </Link>
            <Link href="/ranking" className={mobileLinkClassName('/ranking')}>
              Ranking
            </Link>
            {isAdmin && (
              <Link href="/admin" className={mobileLinkClassName('/admin')}>
                Admin
              </Link>
            )}
          </div>
          <p className="mt-3 border-t border-sky-100 pt-3 text-xs text-slate-500">
            {displayName}
          </p>
        </div>
      )}
    </nav>
  )
}
