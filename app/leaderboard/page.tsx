"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("total_score", { ascending: false })
        .order("problems_solved", { ascending: false })
        .limit(50)

      if (error) throw error

      setLeaderboard(data || [])
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl super-gold-text sparkle-container">Loading leaderboard...</div>
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)
  const remaining = leaderboard.slice(3)

  return (
    <div className="min-h-screen p-8 page-enter">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold super-gold-text sparkle-container mb-4">Leaderboard</h1>
          <p className="text-xl silver-text">The best coders in the vault</p>
        </div>

        {/* Podium */}
        {topThree.length >= 3 && (
          <div className="podium">
            {/* Second Place */}
            <div className="podium-place">
              <div className="user-avatar mb-4" style={{ fontSize: "1.2rem" }}>
                {topThree[1]?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="podium-step podium-second">
                <div className="trophy trophy-silver">🥈</div>
                <div className="silver-text font-bold text-lg">{topThree[1]?.name}</div>
                <div className="silver-text text-sm">{topThree[1]?.total_score} pts</div>
                <div className="silver-text text-xs">{topThree[1]?.problems_solved} solved</div>
              </div>
              <div className="silver-text font-bold text-2xl mt-2">2</div>
            </div>

            {/* First Place */}
            <div className="podium-place">
              <div className="user-avatar mb-4" style={{ fontSize: "1.5rem", width: "60px", height: "60px" }}>
                {topThree[0]?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="podium-step podium-first">
                <div className="trophy trophy-gold">🏆</div>
                <div className="super-gold-text font-bold text-xl sparkle-container">{topThree[0]?.name}</div>
                <div className="gold-text text-base">{topThree[0]?.total_score} pts</div>
                <div className="gold-text text-sm">{topThree[0]?.problems_solved} solved</div>
              </div>
              <div className="gold-text font-bold text-3xl mt-2">1</div>
            </div>

            {/* Third Place */}
            <div className="podium-place">
              <div className="user-avatar mb-4" style={{ fontSize: "1rem" }}>
                {topThree[2]?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="podium-step podium-third">
                <div className="trophy trophy-bronze">🥉</div>
                <div className="text-orange-300 font-bold text-base">{topThree[2]?.name}</div>
                <div className="text-orange-300 text-sm">{topThree[2]?.total_score} pts</div>
                <div className="text-orange-300 text-xs">{topThree[2]?.problems_solved} solved</div>
              </div>
              <div className="text-orange-300 font-bold text-xl mt-2">3</div>
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <div className="glass-card p-6 mt-12">
          <h2 className="text-2xl font-bold super-gold-text sparkle-container mb-6">Full Rankings</h2>
          <div className="space-y-3">
            {remaining.map((user, index) => (
              <div key={user.id} className="leaderboard-rank">
                <div className="rank-number silver-text">{index + 4}</div>
                <div className="user-avatar">{user.name?.charAt(0).toUpperCase() || "U"}</div>
                <div className="flex-1">
                  <Link href={`/profile/${user.id}`} className="super-gold-text font-semibold hover:underline">
                    {user.name}
                  </Link>
                  <div className="silver-text text-sm">{user.email}</div>
                </div>
                <div className="text-right">
                  <div className="gold-text font-bold">{user.total_score} pts</div>
                  <div className="silver-text text-sm">{user.problems_solved} solved</div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <div className="text-2xl silver-text mb-4">No users found</div>
              <p className="silver-text">Be the first to join the leaderboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
