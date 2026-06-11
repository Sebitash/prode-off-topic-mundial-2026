'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { API_URL } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default function GoogleBridgePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        router.replace('/auth/login')
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al iniciar sesión con Google')
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24}`

        await supabase.auth.signOut()
        router.replace('/dashboard')
      } catch (err: any) {
        setError(err.message || 'Error al iniciar sesión con Google')
        await supabase.auth.signOut()
        setTimeout(() => router.replace('/auth/login'), 2000)
      }
    }

    run()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-100 via-sky-50 to-sky-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        {error ? (
          <p className="text-rose-600 dark:text-rose-400">{error}</p>
        ) : (
          <p>Conectando con Google...</p>
        )}
      </div>
    </div>
  )
}
