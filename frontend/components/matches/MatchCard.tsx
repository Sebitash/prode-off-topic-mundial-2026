'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Match {
  id: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  match_date: string
  stage: string
  status: 'scheduled' | 'live' | 'finished'
}

export default function MatchCard({ match, userId }: { match: Match; userId: string }) {
  const [homeScore, setHomeScore] = useState<number>(0)
  const [awayScore, setAwayScore] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: userId,
          match_id: match.id,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        } as any, {
          onConflict: 'user_id,match_id'
        })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving prediction:', error)
      alert('Failed to save prediction')
    } finally {
      setLoading(false)
    }
  }

  const isFinished = match.status === 'finished'
  const isPast = new Date(match.match_date) < new Date()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
            {match.stage}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${
            match.status === 'finished' 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              : match.status === 'live'
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          }`}>
            {match.status}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(match.match_date).toLocaleString()}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="font-semibold text-gray-900 dark:text-white">
              {match.home_team}
            </p>
            {isFinished && match.home_score !== null && (
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {match.home_score}
              </p>
            )}
          </div>
          <div className="px-4 text-gray-500 dark:text-gray-400">vs</div>
          <div className="flex-1 text-center">
            <p className="font-semibold text-gray-900 dark:text-white">
              {match.away_team}
            </p>
            {isFinished && match.away_score !== null && (
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {match.away_score}
              </p>
            )}
          </div>
        </div>

        {!isFinished && !isPast && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
              <span className="text-gray-500 dark:text-gray-400">-</span>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Submit Prediction'}
            </button>
            {success && (
              <p className="text-green-600 dark:text-green-400 text-sm text-center">
                ✓ Prediction saved!
              </p>
            )}
          </form>
        )}

        {isPast && !isFinished && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Match has started - predictions are locked
          </p>
        )}
      </div>
    </div>
  )
}
