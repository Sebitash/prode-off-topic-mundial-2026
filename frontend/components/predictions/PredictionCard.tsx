interface Prediction {
  id: string
  predicted_home_score: number
  predicted_away_score: number
  points: number | null
  created_at: string
  matches: {
    home_team: string
    away_team: string
    home_score: number | null
    away_score: number | null
    match_date: string
    status: string
  }
}

export default function PredictionCard({ prediction }: { prediction: Prediction }) {
  const match = prediction.matches
  const isCorrect = prediction.points !== null && prediction.points > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {match.home_team} vs {match.away_team}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(match.match_date).toLocaleDateString()}
          </p>
        </div>
        {prediction.points !== null && (
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isCorrect 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}>
            {prediction.points} pts
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Prediction</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {prediction.predicted_home_score} - {prediction.predicted_away_score}
          </p>
        </div>

        {match.status === 'finished' && match.home_score !== null && match.away_score !== null && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Actual Result</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {match.home_score} - {match.away_score}
            </p>
          </div>
        )}

        {match.status !== 'finished' && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {match.status === 'live' ? '⚽ Match in progress' : '⏳ Not played yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
