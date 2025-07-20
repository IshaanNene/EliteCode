import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type User = {
  id: string
  email: string
  name: string
  bio?: string
  avatar_url?: string
  problems_solved: number
  total_score: number
  rank: number
  created_at: string
  updated_at: string
}

export type Problem = {
  id: number
  title: string
  difficulty: "easy" | "medium" | "hard"
  category: string
  description: string
  examples: any[]
  constraints: string[]
  starter_code: string
  test_cases: any[]
  acceptance_rate: number
  created_at: string
  updated_at: string
}

export type Submission = {
  id: string
  user_id: string
  problem_id: number
  contest_id?: string
  code: string
  language: string
  status: "accepted" | "wrong_answer" | "time_limit" | "runtime_error"
  runtime?: number
  memory?: number
  score?: number
  created_at: string
}

export type Contest = {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  duration: number
  problems: number[]
  participants: number
  status: "upcoming" | "active" | "ended"
  created_at: string
  updated_at: string
}

export type UserProblemAttempt = {
  id: string
  user_id: string
  problem_id: number
  attempts: number
  solved: boolean
  best_score: number
  first_attempt_at: string
  solved_at?: string
}

export type ContestParticipant = {
  id: string
  contest_id: string
  user_id: string
  score: number
  problems_solved: number
  finish_time?: string
  created_at: string
}

/**
 * Utility to fetch data from Supabase (no timeout).
 * Improved: Returns empty array if no test cases found, and throws only on real errors.
 */
export async function fetchWithGrace<T>(promise: Promise<T>): Promise<T> {
  const result: any = await promise
  // If result is a Supabase response, handle missing data gracefully
  if (result && typeof result === "object" && "data" in result && "error" in result) {
    if (result.error) throw result.error
    // Return empty array if no test cases found, instead of throwing
    if (Array.isArray(result.data)) return result.data as T
    if (result.data === null || result.data === undefined) return [] as unknown as T
  }
  return result
}

