import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const invalidUrl =
    !supabaseUrl ||
    supabaseUrl.includes('TU-PROYECTO') ||
    supabaseUrl.includes('your-project-url')

  const invalidKey =
    !supabaseAnonKey ||
    supabaseAnonKey.includes('PEGA_AQUI') ||
    supabaseAnonKey.includes('your-anon-key')

  if (invalidUrl || invalidKey) {
    throw new Error(
      'Supabase no configurado. Completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local con valores reales de tu proyecto.'
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
