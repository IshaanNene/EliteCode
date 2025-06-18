"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function ProfilePage() {
  const { user, profile, updateProfile, loading } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  })
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    easyProblems: 0,
    mediumProblems: 0,
    hardProblems: 0,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
      })
      fetchUserStats()
      fetchRecentSubmissions()
    }
  }, [profile])

  const fetchUserStats = async () => {
    if (!user) return

    const { data: submissionsData } = await supabase
      .from("submissions")
      .select("status, problems(difficulty)")
      .eq("user_id", user.id)

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
  }

  const fetchRecentSubmissions = async () => {
    if (!user) return

    const { data } = await supabase
      .from("submissions")
      .select("*, problems(title, difficulty)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (data) {
      setSubmissions(data)
    }
  }

  const handleSave = async () => {
    const { error } = await updateProfile(formData)
    if (!error) {
      setEditing(false)
    }
  }

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl super-gold-text sparkle-container">Loading profile...</div>
      </div>
    )
  }

  // Show login prompt if no user
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl super-gold-text sparkle-container mb-4">Authentication Required</div>
          <div className="text-xl silver-text mb-6">Please log in to view your profile</div>
          <Link href="/login" className="btn-gold">
            Login to EliteCode
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 page-enter">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <div className="text-center mb-6">
                <div className="profile-avatar mb-4">{profile.name?.charAt(0).toUpperCase() || "U"}</div>
                {editing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input w-full p-3 text-white text-center"
                      placeholder="Your name"
                    />
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="glass-input w-full p-3 text-white"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="btn-gold flex-1">
                        Save
                      </button>
                      <button onClick={() => setEditing(false)} className="btn-silver flex-1">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold super-gold-text sparkle-container mb-2">{profile.name}</h1>
                    <p className="silver-text mb-4">{profile.email}</p>
                    {profile.bio && <p className="silver-text text-sm mb-4">{profile.bio}</p>}
                    <button onClick={() => setEditing(true)} className="btn-gold">
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="silver-text">Rank</span>
                  <span className="gold-text font-bold sparkle-container">#{profile.rank || "Unranked"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="silver-text">Total Score</span>
                  <span className="gold-text font-bold sparkle-container">{profile.total_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="silver-text">Problems Solved</span>
                  <span className="gold-text font-bold sparkle-container">{profile.problems_solved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="silver-text">Acceptance Rate</span>
                  <span className="gold-text font-bold sparkle-container">
                    {stats.totalSubmissions > 0
                      ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Problem Stats */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold super-gold-text sparkle-container mb-6">Problem Statistics</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats.easyProblems}</div>
                  <div className="difficulty-easy inline-block">Easy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.mediumProblems}</div>
                  <div className="difficulty-medium inline-block">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">{stats.hardProblems}</div>
                  <div className="difficulty-hard inline-block">Hard</div>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold super-gold-text sparkle-container mb-6">Recent Activity</h2>
              <div className="space-y-3">
                {submissions.length > 0 ? (
                  submissions.map((submission: any) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            submission.status === "accepted" ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        <Link href={`/editor/${submission.problem_id}`} className="gold-text hover:underline">
                          {submission.problems?.title}
                        </Link>
                        <span className={`difficulty-${submission.problems?.difficulty}`}>
                          {submission.problems?.difficulty}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="silver-text text-sm">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            submission.status === "accepted" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {submission.status.replace("_", " ").toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center silver-text py-8">
                    No submissions yet.{" "}
                    <Link href="/problems" className="gold-text hover:underline">
                      Start solving problems!
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
