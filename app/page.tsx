"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { fetchWithTimeout, supabase } from "@/lib/supabase"

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [problems, setProblems] = useState<any[]>([])

  useEffect(() => {
    async function loadProblems() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await fetchWithTimeout(
          supabase.from("problems").select("*").order("id", { ascending: true })
        )
        if (error || !data) throw new Error("Problems not found")
        setProblems(data)
      } catch (err: any) {
        setError(err.message || "Failed to load problems")
      } finally {
        setLoading(false)
      }
    }
    loadProblems()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" />
        <span className="ml-4 text-lg font-semibold">Loading problems...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg font-semibold">
          {error} <br />
          Please check your connection or try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 page-enter">
      <div className="text-center space-y-8">
        <h1 className="text-8xl font-bold super-gold-text sparkle-container mb-4">EliteCode</h1>
        <p className="text-2xl silver-text mb-12">Master the Art of Programming</p>
        <div className="flex gap-6 justify-center">
          <Link href="/signup" className="btn-gold">
            Join Elite
          </Link>
          <Link href="/login" className="btn-silver">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
