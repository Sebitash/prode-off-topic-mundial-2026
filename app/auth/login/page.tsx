'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '../../c38ba24b5b87da3b6be5ebf465027ad8.png'
export const dynamic = "force-dynamic";
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.replace('/dashboard/rules')
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoadingGoogle(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard/rules`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      setLoadingGoogle(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-sky-200 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 overflow-hidden rounded-full">
            <Image src={logo} alt="Prode Mundial" width={48} height={48} className="h-12 w-12 object-cover" priority />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Prode Mundial 2026
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa a tu cuenta para participar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Contrasena
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2 pr-10 text-sm font-semibold text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  {showPassword ? (
                    <>
                      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.4 5.4C10.2 5.1 11.1 5 12 5c6 0 10 7 10 7a17.4 17.4 0 0 1-4.2 5.1" />
                      <path d="M6.2 6.2A17.3 17.3 0 0 0 2 12s4 7 10 7c1.3 0 2.5-.2 3.6-.6" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          O CONTINUA CON
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-500 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-green-500 text-[10px] font-bold">
            G
          </span>
          {loadingGoogle ? 'Conectando...' : 'Continuar con Google'}
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          No tienes cuenta?{' '}
          <Link href="/auth/signup" className="font-semibold text-sky-600 hover:text-sky-700">
            Registrate aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
