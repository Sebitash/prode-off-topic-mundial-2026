'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { API_URL } from '@/lib/config'

function EditNameModal({ onClose }: { onClose: () => void }) {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const current = stored ? JSON.parse(stored) : { nombre: '', apellido: '' }
  const [nombre, setNombre] = useState(current.nombre || '')
  const [apellido, setApellido] = useState(current.apellido || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !apellido.trim()) {
      setError('Completá nombre y apellido')
      return
    }

    setSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/user/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: nombre.trim(), apellido: apellido.trim() }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el nombre')

      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const u = JSON.parse(storedUser)
        localStorage.setItem('user', JSON.stringify({ ...u, nombre: data.user.nombre, apellido: data.user.apellido }))
      }

      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el nombre')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Editar nombre</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Así vas a aparecer en el saludo de Inicio y en la tabla de Ranking.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={50}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Apellido</label>
            <input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              maxLength={50}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function DashboardNav({ displayName, isAdmin = false }: { displayName: string; isAdmin?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const linkClassName = (href: string) =>
    pathname === href
      ? 'text-sky-800 dark:text-sky-400'
      : 'text-slate-700 hover:text-sky-700 dark:text-slate-300 dark:hover:text-sky-400'

  const mobileLinkClassName = (href: string) =>
    `rounded-lg px-3 py-2 ${pathname === href ? 'bg-sky-50 text-sky-800 dark:bg-slate-800 dark:text-sky-400' : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400'}`

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
    <>
    <nav className="border-b border-sky-200/60 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
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
            <Link href="/historial" className={linkClassName('/historial')}>
              Historial
            </Link>
            {isAdmin && (
              <Link href="/admin" className={linkClassName('/admin')}>
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1 text-xs text-slate-500 dark:text-slate-400 md:inline-flex">
            {displayName}
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label="Editar nombre"
              title="Editar nombre"
              className="rounded-full p-1 transition hover:bg-sky-50 dark:hover:bg-slate-800"
            >
              ✏️
            </button>
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className="flex h-8 w-8 items-center justify-center rounded-full text-base transition hover:bg-sky-50 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={handleLogout}
            className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            Logout
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-sky-200/60 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
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
            <Link href="/historial" className={mobileLinkClassName('/historial')}>
              Historial
            </Link>
            {isAdmin && (
              <Link href="/admin" className={mobileLinkClassName('/admin')}>
                Admin
              </Link>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-sky-100 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <p className="flex items-center gap-1">
              {displayName}
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                aria-label="Editar nombre"
                title="Editar nombre"
                className="rounded-full p-1 transition hover:bg-sky-50 dark:hover:bg-slate-800"
              >
                ✏️
              </button>
            </p>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              className="flex h-8 w-8 items-center justify-center rounded-full text-base transition hover:bg-sky-50 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      )}
    </nav>
    {editOpen && <EditNameModal onClose={() => setEditOpen(false)} />}
    </>
  )
}
