import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

declare const process: {
  env: Record<string, string | undefined>
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email) {
    const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
      id: user.id,
      email: user.email,
    }

    await (supabase as any).from('profiles').upsert(profilePayload, { onConflict: 'id' })
  }

  const isAuthRoute = pathname.startsWith('/auth')
  const isAuthCallbackRoute = pathname.startsWith('/auth/callback')
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/matches') ||
    pathname.startsWith('/predictions') ||
    pathname.startsWith('/ranking')

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach((cookie: { name: string; value: string }) => redirectResponse.cookies.set(cookie.name, cookie.value))
    return redirectResponse
  }

  if (user && isAuthRoute && !isAuthCallbackRoute) {
    const redirectUrl = new URL('/dashboard/rules', request.url)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach((cookie: { name: string; value: string }) => redirectResponse.cookies.set(cookie.name, cookie.value))
    return redirectResponse
  }

  return response
}
export async function middleware(request: NextRequest) {
  return updateSession(request)
}