import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PredictionCard from '@/components/predictions/PredictionCard'

export default async function PredictionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: predictions } = await supabase
    .from('predictions')
    .select(`
      *,
      matches (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Predictions
        </h1>

        {predictions && predictions.length > 0 ? (
          <div className="space-y-4">
            {predictions.map((prediction: any) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              You haven't made any predictions yet.
            </p>
            <a
              href="/matches"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Predicting
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
