'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import logo from '../../c38ba24b5b87da3b6be5ebf465027ad8.png'

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setSent(true)
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el email de recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-sky-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 overflow-hidden rounded-full">
            <Image src={logo} alt="Prode Mundial" width={48} height={48} className="h-12 w-12 object-cover" priority />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Recuperar contraseña
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Te enviamos un link para restablecer tu contraseña
          </p>
        </div>

        {sent ? (
          <div className="mt-6 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            Si existe una cuenta con ese email, te enviamos un link para restablecer tu contraseña. Revisá tu bandeja de entrada (y spam).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {error && (
              <div className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/auth/login" className="font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:text-sky-400">
            ← Volver a inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
