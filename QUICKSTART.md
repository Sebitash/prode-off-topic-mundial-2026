# Quick Start Guide

This guide will help you get the Mundial 2026 Prode app up and running in minutes.

## Prerequisites

- Node.js 18 or higher
- A Supabase account (free tier works great!)

## Step 1: Clone the Repository

```bash
git clone https://github.com/Sebitash/Prode-OffTopic-Mundial2026.git
cd Prode-OffTopic-Mundial2026
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to Project Settings > API
3. Copy your project URL and anon/public key

## Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and replace the placeholder values:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Set Up the Database

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste into the SQL Editor and run it

This will create all necessary tables, functions, triggers, and sample data.

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## What's Next?

1. **Create an Account**: Click "Sign Up" and create your account
2. **View Matches**: Browse the upcoming World Cup matches
3. **Make Predictions**: Submit your predictions for upcoming matches
4. **Check Leaderboard**: See how you rank against other users

## Features Available

✅ User authentication (sign up, login, logout)
✅ Protected dashboard with stats
✅ Match listings with real-time status
✅ Prediction submission
✅ Points system (auto-calculated)
✅ Leaderboard/ranking
✅ Dark mode support
✅ Fully responsive design

## Scoring System

- **Exact Score**: 3 points
- **Correct Winner/Draw**: 1 point
- **Incorrect**: 0 points

Points are automatically calculated when matches are marked as finished.

## Customization Tips

### Adding Your Own Matches

1. Go to your Supabase dashboard
2. Navigate to Table Editor > matches
3. Add new matches with:
   - Home team and away team names
   - Match date and time
   - Stage (e.g., "Group Stage", "Round of 16")
   - Status (scheduled/live/finished)

### Updating Match Results

1. Go to Table Editor > matches
2. Find the match
3. Update `home_score`, `away_score`, and set `status` to "finished"
4. Points will be automatically calculated for all predictions!

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy!

### Environment Variables for Production

Make sure to add these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Build Errors

If you get build errors, ensure:
- Node.js version is 18 or higher
- All dependencies are installed (`npm install`)
- Environment variables are set correctly

### Authentication Issues

If auth isn't working:
- Verify your Supabase URL and key are correct
- Check that the database schema was applied successfully
- Ensure email confirmation is disabled in Supabase Auth settings (for development)

### Database Errors

If you see database errors:
- Verify the schema.sql was run successfully
- Check that RLS policies are enabled
- Ensure your Supabase project is active

## Need Help?

- Check the main [README.md](README.md) for detailed information
- Review the [Supabase Documentation](https://supabase.com/docs)
- Open an issue on GitHub

---

Happy predicting! 🏆⚽
