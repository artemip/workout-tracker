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
      exercise_logs: {
        Row: {
          created_at: string | null
          exercise_id: number
          id: number
          reps_completed: number
          set_number: number
          weight_used: number
          workout_exercise_id: number
        }
        Insert: {
          created_at?: string | null
          exercise_id: number
          id?: number
          reps_completed: number
          set_number: number
          weight_used: number
          workout_exercise_id: number
        }
        Update: {
          created_at?: string | null
          exercise_id?: number
          id?: number
          reps_completed?: number
          set_number?: number
          weight_used?: number
          workout_exercise_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_logs_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      exercises: {
        Row: {
          created_at: string | null
          id: number
          name: string
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          end_with_drop_set: boolean
          exercise_id: number
          id: number
          num_reps_per_set: number
          num_sets: number
          order: number
          rest_time_seconds: number
          weight: number
          workout_id: number
        }
        Insert: {
          created_at?: string | null
          end_with_drop_set?: boolean
          exercise_id: number
          id?: number
          num_reps_per_set: number
          num_sets: number
          order: number
          rest_time_seconds: number
          weight: number
          workout_id: number
        }
        Update: {
          created_at?: string | null
          end_with_drop_set?: boolean
          exercise_id?: number
          id?: number
          num_reps_per_set?: number
          num_sets?: number
          order?: number
          rest_time_seconds?: number
          weight?: number
          workout_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      workouts: {
        Row: {
          created_at: string | null
          id: number
          meso_cycle: number
          name: string
          order: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          meso_cycle: number
          name: string
          order: number
        }
        Update: {
          created_at?: string | null
          id?: number
          meso_cycle?: number
          name?: string
          order?: number
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
