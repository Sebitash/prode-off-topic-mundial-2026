# Database Documentation

This document describes the database schema for the Mundial 2026 Prode application.

## Overview

The application uses Supabase (PostgreSQL) as its database with Row Level Security (RLS) enabled for data protection.

## Tables

### `profiles`

User profile information linked to Supabase Auth users.

| Column      | Type      | Description                                    |
|-------------|-----------|------------------------------------------------|
| id          | UUID      | Primary key, references auth.users             |
| email       | TEXT      | User's email address                           |
| username    | TEXT      | Display name (nullable)                        |
| avatar_url  | TEXT      | URL to user's avatar image (nullable)          |
| created_at  | TIMESTAMP | When the profile was created                   |
| updated_at  | TIMESTAMP | Last update timestamp                          |

**Policies:**
- Public profiles are viewable by everyone
- Users can update their own profile
- Users can insert their own profile

**Trigger:**
- Auto-creates profile when a new user signs up via `handle_new_user()` function

---

### `matches`

World Cup matches information.

| Column      | Type      | Description                                    |
|-------------|-----------|------------------------------------------------|
| id          | UUID      | Primary key (auto-generated)                   |
| home_team   | TEXT      | Home team name                                 |
| away_team   | TEXT      | Away team name                                 |
| home_score  | INTEGER   | Home team score (nullable until finished)      |
| away_score  | INTEGER   | Away team score (nullable until finished)      |
| match_date  | TIMESTAMP | When the match is/was played                   |
| stage       | TEXT      | Tournament stage (e.g., "Group Stage")         |
| status      | TEXT      | Match status: 'scheduled', 'live', 'finished'  |
| created_at  | TIMESTAMP | When the match was created                     |
| updated_at  | TIMESTAMP | Last update timestamp                          |

**Policies:**
- Matches are viewable by everyone
- Only admins can modify matches (not implemented in RLS yet)

**Indexes:**
- `idx_matches_date` on match_date
- `idx_matches_status` on status

**Trigger:**
- `calculate_points_on_match_finish` - Calculates prediction points when status changes to 'finished'

---

### `predictions`

User predictions for matches.

| Column                 | Type      | Description                              |
|------------------------|-----------|------------------------------------------|
| id                     | UUID      | Primary key (auto-generated)             |
| user_id                | UUID      | Foreign key to profiles                  |
| match_id               | UUID      | Foreign key to matches                   |
| predicted_home_score   | INTEGER   | User's predicted home team score         |
| predicted_away_score   | INTEGER   | User's predicted away team score         |
| points                 | INTEGER   | Points earned (nullable until calculated)|
| created_at             | TIMESTAMP | When the prediction was created          |
| updated_at             | TIMESTAMP | Last update timestamp                    |

**Constraints:**
- Unique constraint on (user_id, match_id) - one prediction per user per match

**Policies:**
- Users can view their own predictions
- Users can insert their own predictions
- Users can update their predictions only before match starts

**Indexes:**
- `idx_predictions_user_id` on user_id
- `idx_predictions_match_id` on match_id

---

## Views

### `leaderboard`

Aggregated view of user rankings.

| Column            | Type    | Description                        |
|-------------------|---------|------------------------------------|
| user_id           | UUID    | User identifier                    |
| username          | TEXT    | User's display name                |
| email             | TEXT    | User's email                       |
| total_points      | INTEGER | Sum of all points earned           |
| total_predictions | INTEGER | Count of predictions made          |

**SQL:**
```sql
SELECT 
  p.user_id,
  pr.username,
  pr.email,
  COALESCE(SUM(p.points), 0) as total_points,
  COUNT(p.id) as total_predictions
FROM profiles pr
LEFT JOIN predictions p ON pr.id = p.user_id
GROUP BY p.user_id, pr.username, pr.email
ORDER BY total_points DESC
```

---

## Functions

### `handle_new_user()`

Automatically creates a profile when a new user signs up via Supabase Auth.

**Trigger:** After INSERT on auth.users
**Logic:**
- Extracts username from user metadata or derives from email
- Creates a new profile record with user's ID and email

---

### `calculate_prediction_points()`

Calculates points for all predictions when a match finishes.

**Trigger:** After UPDATE on matches when status = 'finished'
**Scoring System:**
- **3 points**: Exact score prediction
- **1 point**: Correct outcome (winner or draw)
- **0 points**: Incorrect prediction

**Logic:**
```sql
CASE
  WHEN exact_score THEN 3
  WHEN correct_outcome THEN 1
  ELSE 0
END
```

---

### `update_updated_at_column()`

Updates the `updated_at` timestamp automatically.

**Triggers:** 
- Before UPDATE on profiles
- Before UPDATE on matches
- Before UPDATE on predictions

---

## Row Level Security (RLS)

All tables have RLS enabled to ensure data security:

### Profiles
- ✅ Anyone can view profiles (public leaderboard)
- ✅ Users can only modify their own profile

### Matches
- ✅ Anyone can view matches
- ⚠️ Admin-only modification not yet implemented

### Predictions
- ✅ Users can only view their own predictions
- ✅ Users can only create predictions for themselves
- ✅ Predictions can only be updated before match starts

---

## Sample Data

The schema includes 8 sample matches for the 2026 World Cup:

1. Mexico vs Canada
2. USA vs Wales
3. Argentina vs Morocco
4. Brazil vs Japan
5. Germany vs Australia
6. Spain vs Croatia
7. France vs Denmark
8. England vs Iran

All matches are set to "scheduled" status and dated in June 2026.

---

## Migration Guide

To set up the database:

1. Open Supabase SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Execute the SQL
4. Verify all tables, functions, and triggers were created

To verify setup:
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check sample matches
SELECT * FROM matches;
```

---

## Future Enhancements

Potential database improvements:

- [ ] Add teams table for better data normalization
- [ ] Add tournaments/competitions table for multi-tournament support
- [ ] Add user_achievements table for badges/trophies
- [ ] Add match_comments table for social features
- [ ] Add admin roles table for match management
- [ ] Add prediction_history for tracking changes
- [ ] Add real-time subscriptions for live updates

---

## Backup & Recovery

Remember to:
- Regular backups via Supabase dashboard
- Export schema periodically
- Version control all schema changes
- Test recovery procedures

---

For questions about the database schema, please refer to the [Contributing Guide](CONTRIBUTING.md) or open an issue.
