"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ContestsPage() {
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase.from("contests").select("*").order("start_time", { ascending: false })

      if (error) throw error

      setContests(data || [])
    } catch (error) {
      console.error("Error fetching contests:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl super-gold-text sparkle-container">Loading contests...</div>
      </div>
    )
  }

  const filteredContests = contests.filter((contest) => {
    if (activeTab === "all") return true
    return contest.status === activeTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "text-blue-400"
      case "active":
        return "text-green-400"
      case "ended":
        return "text-gray-400"
      default:
        return "text-silver"
    }
  }

  const getTimeRemaining = (startTime: string, endTime: string, status: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (status === "upcoming") {
      const diff = start.getTime() - now.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) return `Starts in ${days}d ${hours}h`
      if (hours > 0) return `Starts in ${hours}h ${minutes}m`
      return `Starts in ${minutes}m`
    }

    if (status === "active") {
      const diff = end.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) return `${hours}h ${minutes}m remaining`
      return `${minutes}m remaining`
    }

    return "Ended"
  }

  return (
    <div className="min-h-screen p-8 page-enter">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold super-gold-text sparkle-container mb-4">Contests</h1>
          <p className="text-xl silver-text">Compete with elite coders worldwide</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-2 flex gap-2">
            {["all", "upcoming", "active", "ended"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === tab ? "bg-gold/20 gold-text" : "silver-text hover:gold-text"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Contests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => (
            <div key={contest.id} className="glass-card p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold super-gold-text">{contest.title}</h3>
                <span className={`text-sm font-semibold ${getStatusColor(contest.status)}`}>
                  {contest.status.toUpperCase()}
                </span>
              </div>

              <p className="silver-text text-sm mb-4 line-clamp-3">{contest.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="silver-text">Duration:</span>
                  <span className="gold-text">{contest.duration} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="silver-text">Problems:</span>
                  <span className="gold-text">{contest.problems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="silver-text">Participants:</span>
                  <span className="gold-text">{contest.participants.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="silver-text">Status:</span>
                  <span className={getStatusColor(contest.status)}>
                    {getTimeRemaining(contest.start_time, contest.end_time, contest.status)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {contest.status === "active" ? (
                  <Link href={`/contests/${contest.id}`} className="btn-gold flex-1 text-center">
                    Join Contest
                  </Link>
                ) : contest.status === "upcoming" ? (
                  <button className="btn-silver flex-1" disabled>
                    Register
                  </button>
                ) : (
                  <Link href={`/contests/${contest.id}/results`} className="btn-silver flex-1 text-center">
                    View Results
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredContests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-2xl silver-text mb-4">No contests found</div>
            <p className="silver-text">Check back later for upcoming contests!</p>
          </div>
        )}
      </div>
    </div>
  )
}
