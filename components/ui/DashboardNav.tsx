'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function DashboardNav({ user }: { user: User }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const linkClassName = (href: string) =>
    pathname === href
      ? 'text-sky-800'
      : 'text-slate-700 hover:text-sky-700'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-sky-200/60 bg-white/80 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <button type="button" className="flex items-center gap-2 text-sky-700">
            <span className="text-xl">⚽</span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-semibold">Prode 2026</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">
                FIFA World Cup
              </span>
            </span>
          </button>
          <div className="hidden md:flex space-x-4 text-sm font-semibold">
            <Link href="/dashboard/rules" className={linkClassName('/dashboard/rules')}>
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
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 md:inline">
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
