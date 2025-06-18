"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    easyProblems: 0,
    mediumProblems: 0,
    hardProblems: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      setProfile(profileData)

      // Fetch user stats
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("status, problems(difficulty)")
        .eq("user_id", userId)

      if (submissionsData) {
        const totalSubmissions = submissionsData.length
        const acceptedSubmissions = submissionsData.filter((s) => s.status === "accepted").length
        const acceptedProblems = submissionsData.filter((s) => s.status === "accepted")

        const easyProblems = acceptedProblems.filter((s) => s.problems?.difficulty === "easy").length
        const mediumProblems = acceptedProblems.filter((s) => s.problems?.difficulty === "medium").length
        const hardProblems = acceptedProblems.filter((s) => s.problems?.difficulty === "hard").length

        setStats({
          totalSubmissions,
          acceptedSubmissions,
          easyProblems,
          mediumProblems,
          hardProblems,
        })
      }

      // Fetch recent submissions
      const { data: recentSubmissions } = await supabase
        .from("submissions")
        .select("*, problems(title, difficulty)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (recentSubmissions) {
        setSubmissions(recentSubmissions)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl super-gold-text sparkle-container">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl super-gold-text mb-4">Profile Not Found</div>
          <Link href="/leaderboard" className="btn-gold">
            Back to Leaderboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 page-enter">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8 text-center">
          <div className="profile-avatar mx-auto mb-6">{profile.name?.charAt(0).toUpperCase() || "U"}</div>
          <h1 className="text-5xl font-bold super-gold-text sparkle-container mb-4">{profile.name}</h1>
          <p className="text-xl silver-text mb-4">{profile.email}</p>
          {profile.bio && <p className="text-lg silver-text max-w-2xl mx-auto mb-6">{profile.bio}</p>}

          <div className="flex justify-center items-center gap-8 text-lg">
            <div className="text-center">
              <div className="super-gold-text text-2xl font-bold">#{profile.rank || "Unranked"}</div>
              <div className="silver-text">Global Rank</div>
            </div>
            <div className="text-center">
              <div className="super-gold-text text-2xl font-bold">{profile.total_score}</div>
              <div className="silver-text">Total Score</div>
            </div>
            <div className="text-center">
              <div className="super-gold-text text-2xl font-bold">{profile.problems_solved}</div>
              <div className="silver-text">Problems Solved</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Statistics */}
          <div className="glass-card p-6">
            <h2 className="text-3xl font-bold super-gold-text sparkle-container mb-6">Statistics</h2>

            {/* Problem Difficulty Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="profile-stat-card">
                <div className="profile-stat-number text-green-400">{stats.easyProblems}</div>
                <div className="profile-stat-label silver-text">Easy</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-number text-yellow-400">{stats.mediumProblems}</div>
                <div className="profile-stat-label silver-text">Medium</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-number text-red-400">{stats.hardProblems}</div>
                <div className="profile-stat-label silver-text">Hard</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                <span className="silver-text">Total Submissions</span>
                <span className="gold-text font-bold text-xl">{stats.totalSubmissions}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                <span className="silver-text">Accepted Submissions</span>
                <span className="gold-text font-bold text-xl">{stats.acceptedSubmissions}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                <span className="silver-text">Acceptance Rate</span>
                <span className="gold-text font-bold text-xl">
                  {stats.totalSubmissions > 0
                    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                <span className="silver-text">Member Since</span>
                <span className="gold-text font-bold">{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-6">
            <h2 className="text-3xl font-bold super-gold-text sparkle-container mb-6">Recent Activity</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {submissions.length > 0 ? (
                submissions.map((submission: any) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          submission.status === "accepted" ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                      <div>
                        <Link
                          href={`/editor/${submission.problem_id}`}
                          className="gold-text hover:underline font-semibold"
                        >
                          {submission.problems?.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`difficulty-${submission.problems?.difficulty}`}>
                            {submission.problems?.difficulty}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              submission.status === "accepted" ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {submission.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="silver-text text-sm">{new Date(submission.created_at).toLocaleDateString()}</div>
                      {submission.score && <div className="gold-text text-sm font-bold">{submission.score} pts</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center silver-text py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <div className="text-lg">No submissions yet</div>
                  <div className="text-sm opacity-70">This user hasn't solved any problems yet</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievement Badges (Mock) */}
        <div className="glass-card p-6 mt-8">
          <h2 className="text-3xl font-bold super-gold-text sparkle-container mb-6">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.easyProblems >= 10 && (
              <div className="profile-stat-card text-center">
                <div className="text-3xl mb-2">🥉</div>
                <div className="silver-text text-sm">Easy Explorer</div>
                <div className="gold-text text-xs">10+ Easy Problems</div>
              </div>
            )}
            {stats.mediumProblems >= 5 && (
              <div className="profile-stat-card text-center">
                <div className="text-3xl mb-2">🥈</div>
                <div className="silver-text text-sm">Medium Master</div>
                <div className="gold-text text-xs">5+ Medium Problems</div>
              </div>
            )}
            {stats.hardProblems >= 1 && (
              <div className="profile-stat-card text-center">
                <div className="text-3xl mb-2">🥇</div>
                <div className="silver-text text-sm">Hard Hero</div>
                <div className="gold-text text-xs">1+ Hard Problems</div>
              </div>
            )}
            {profile.problems_solved >= 50 && (
              <div className="profile-stat-card text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="silver-text text-sm">Problem Solver</div>
                <div className="gold-text text-xs">50+ Problems</div>
              </div>
            )}
            {stats.totalSubmissions >= 100 && (
              <div className="profile-stat-card text-center">
                <div className="text-3xl mb-2">💪</div>
                <div className="silver-text text-sm">Persistent</div>
                <div className="gold-text text-xs">100+ Submissions</div>
              </div>
            )}
            {profile.rank && profile.rank <= 10 && (
              <div className="profile-stat-card text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="silver-text text-sm">Top 10</div>
                <div className="gold-text text-xs">Elite Coder</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
