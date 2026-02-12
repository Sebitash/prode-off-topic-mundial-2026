# Mundial 2026 Prode - World Cup Prediction App

A modern, full-stack World Cup prediction application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Authentication System**: Secure sign-up and login with Supabase Auth
- **Protected Dashboard**: Personalized user dashboard with stats and quick actions
- **Match Management**: View all World Cup matches with real-time status updates
- **Predictions**: Make predictions for upcoming matches and track accuracy
- **Leaderboard**: Compete with other users and climb the ranking
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode**: Automatic dark mode support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Deployment**: Vercel (recommended)

## 📦 Project Structure

```
├── app/
│   ├── auth/
│   │   ├── login/           # Login page
│   │   └── signup/          # Sign-up page
│   ├── dashboard/           # Protected dashboard
│   ├── matches/             # Matches listing
│   ├── predictions/         # User predictions
│   ├── ranking/             # Leaderboard
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── auth/                # Auth components
│   ├── matches/             # Match components
│   ├── predictions/         # Prediction components
│   └── ui/                  # UI components
├── lib/
│   ├── supabase/            # Supabase clients
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Middleware helper
│   └── utils/               # Utility functions
├── types/
│   └── database.types.ts    # Database TypeScript types
└── middleware.ts            # Next.js middleware for auth
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Sebitash/Prode-OffTopic-Mundial2026.git
cd Prode-OffTopic-Mundial2026
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under "API".

4. **Set up the database**

Run the SQL commands from `supabase/schema.sql` in your Supabase SQL Editor to create the necessary tables and views.

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The application uses the following main tables:

- **profiles**: User profiles with username and avatar
- **matches**: World Cup matches with teams, scores, and status
- **predictions**: User predictions for matches
- **leaderboard**: View for ranking users by points

See `supabase/schema.sql` for the complete schema.

## 🔐 Authentication

Authentication is handled by Supabase Auth with:
- Email/password authentication
- Protected routes via Next.js middleware
- Automatic session management

## 📝 Making Predictions

1. Navigate to the Matches page
2. Find an upcoming match
3. Enter your predicted score for both teams
4. Submit your prediction

Predictions are locked once a match starts. Points are automatically calculated when matches finish.

## 🏆 Scoring System

The scoring system can be customized in your Supabase functions. A typical system might be:
- Exact score: 3 points
- Correct winner: 1 point
- Incorrect: 0 points

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Environment Variables

Make sure to add these environment variables in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Add real-time match updates
- [ ] Implement group stage predictions
- [ ] Add social features (comments, reactions)
- [ ] Create admin panel for managing matches
- [ ] Add email notifications for match reminders
- [ ] Implement achievement badges
- [ ] Add match statistics and analytics

---

Built with ❤️ for World Cup 2026
