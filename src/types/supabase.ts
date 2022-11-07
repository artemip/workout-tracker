export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      exercise_logs: {
        Row: {
          id: number
          created_at: string | null
          workout_exercise_id: number
          set_number: number
          reps_completed: number
          weight_used: number
        }
        Insert: {
          id?: number
          created_at?: string | null
          workout_exercise_id: number
          set_number: number
          reps_completed: number
          weight_used: number
        }
        Update: {
          id?: number
          created_at?: string | null
          workout_exercise_id?: number
          set_number?: number
          reps_completed?: number
          weight_used?: number
        }
      }
      exercises: {
        Row: {
          id: number
          created_at: string | null
          name: string
          type: string | null
          url: string | null
        }
        Insert: {
          id?: number
          created_at?: string | null
          name: string
          type?: string | null
          url?: string | null
        }
        Update: {
          id?: number
          created_at?: string | null
          name?: string
          type?: string | null
          url?: string | null
        }
      }
      workout_exercises: {
        Row: {
          id: number
          created_at: string | null
          exercise_id: number
          workout_id: number
          order: number
          num_sets: number
          num_reps_per_set: number
          weight: number
          rest_time_seconds: number
          end_with_drop_set: boolean
        }
        Insert: {
          id?: number
          created_at?: string | null
          exercise_id: number
          workout_id: number
          order: number
          num_sets: number
          num_reps_per_set: number
          weight: number
          rest_time_seconds: number
          end_with_drop_set?: boolean
        }
        Update: {
          id?: number
          created_at?: string | null
          exercise_id?: number
          workout_id?: number
          order?: number
          num_sets?: number
          num_reps_per_set?: number
          weight?: number
          rest_time_seconds?: number
          end_with_drop_set?: boolean
        }
      }
      workouts: {
        Row: {
          id: number
          created_at: string | null
          order: number
          name: string
          meso_cycle: number
        }
        Insert: {
          id?: number
          created_at?: string | null
          order: number
          name: string
          meso_cycle: number
        }
        Update: {
          id?: number
          created_at?: string | null
          order?: number
          name?: string
          meso_cycle?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
