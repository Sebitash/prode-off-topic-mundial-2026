import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchCard from '@/components/matches/MatchCard'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          World Cup 2026 Matches
        </h1>

        {matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(matches as any[]).map((match: any) => (
              <MatchCard key={match.id} match={match} userId={user.id} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No matches available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
