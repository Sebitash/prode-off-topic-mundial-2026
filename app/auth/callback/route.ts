import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_description = requestUrl.searchParams.get('error_description')
  const nextPath = requestUrl.searchParams.get('next') || '/dashboard/rules'
  
  console.log('[OAuth Callback]', { code: code ? 'present' : 'MISSING', error_description, nextPath })

  if (error_description) {
    console.error('[OAuth Callback] OAuth error:', error_description)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const redirectUrl = new URL(nextPath, request.url)
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      console.log('[OAuth Callback] Exchange result:', { success: !!data, error: error?.message })
      if (error) throw error
    } catch (err: any) {
      console.error('[OAuth Callback] Exception:', err.message || err)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return response
}
