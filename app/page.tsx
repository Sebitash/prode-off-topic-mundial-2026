import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col gap-8 items-center max-w-4xl px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
          🏆 Mundial 2026 Prode
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
          Welcome to the OffTopic World Cup 2026 Prediction Game! 
          Predict match results, compete with friends, and climb the leaderboard.
        </p>
        
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link
            href="/auth/login"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Sign Up
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-solid border-green-600 text-green-600 transition-colors flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Go to Dashboard →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">⚽ Matches</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View all World Cup matches and make your predictions
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">🎯 Predictions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Submit your predictions and track your accuracy
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">🏅 Ranking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Compete with others and see who's the best predictor
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
