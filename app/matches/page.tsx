export const dynamic = "force-dynamic";
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/ui/DashboardNav'
import ResultsTabs from '@/components/matches/ResultsTabs'

export default async function MatchesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <DashboardNav user={user} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ResultsTabs
          matches={(matches as any[]) || []}
          userId={user.id}
          allowPredict={false}
        />
      </div>
    </div>
  )
}
