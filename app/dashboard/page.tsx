import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user stats
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user?.id || '')

  const totalPoints = (predictions as any[] || []).reduce((sum: number, p: any) => sum + (p.points || 0), 0)

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })
    .limit(5)

  const scheduledMatches = (matches as any[] || []).filter((m: any) => m.status === 'scheduled')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome, {user?.email}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's your Mundial 2026 dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Your Predictions
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {predictions?.length || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total predictions made
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Total Points
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {totalPoints}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Points earned
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Upcoming Matches
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {scheduledMatches.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Matches to predict
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/matches"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              View All Matches
            </Link>
            <Link
              href="/predictions"
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              My Predictions
            </Link>
            <Link
              href="/ranking"
              className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Matches
          </h2>
          {matches && matches.length > 0 ? (
            <div className="space-y-3">
              {(matches as any[]).slice(0, 5).map((match: any) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {match.home_team} vs {match.away_team}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(match.match_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {match.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming matches at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
