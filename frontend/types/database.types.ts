export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          home_team: string
          away_team: string
          home_score: number | null
          away_score: number | null
          match_date: string
          stage: string
          status: 'scheduled' | 'live' | 'finished'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          home_team: string
          away_team: string
          home_score?: number | null
          away_score?: number | null
          match_date: string
          stage: string
          status?: 'scheduled' | 'live' | 'finished'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          home_team?: string
          away_team?: string
          home_score?: number | null
          away_score?: number | null
          match_date?: string
          stage?: string
          status?: 'scheduled' | 'live' | 'finished'
          created_at?: string
          updated_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          match_id: string
          predicted_home_score: number
          predicted_away_score: number
          points: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          predicted_home_score: number
          predicted_away_score: number
          points?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          predicted_home_score?: number
          predicted_away_score?: number
          points?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          user_id: string
          username: string | null
          email: string
          total_points: number
          total_predictions: number
        }
      }
    }
  }
}
