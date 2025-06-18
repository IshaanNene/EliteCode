"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

const mockContestData = {
  id: "2",
  title: "Speed Coding Sprint",
  description: "Fast-paced contest with easy to medium problems. Perfect for beginners!",
  start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  end_time: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
  duration: 120,
  problems: [
    { id: 1, title: "Two Sum", difficulty: "easy", points: 100, solved: false },
    { id: 5, title: "Valid Parentheses", difficulty: "easy", points: 150, solved: true },
    { id: 7, title: "Merge Two Sorted Lists", difficulty: "medium", points: 200, solved: false },
  ],
  participants: 892,
  status: "active" as const,
  leaderboard: [
    { rank: 1, name: "CodeMaster", score: 450, problems_solved: 3, time: "45:23" },
    { rank: 2, name: "AlgoWiz", score: 400, problems_solved: 3, time: "52:17" },
    { rank: 3, name: "DevNinja", score: 350, problems_solved: 2, time: "38:45" },
    { rank: 4, name: "ByteHunter", score: 300, problems_solved: 2, time: "41:12" },
    { rank: 5, name: "LogicLord", score: 250, problems_solved: 2, time: "55:30" },
  ],
}

export default function ContestPage() {
  const params = useParams()
  const contestId = params.id as string
  const [contest] = useState(mockContestData)
  const [activeTab, setActiveTab] = useState("problems")
  const [timeRemaining, setTimeRemaining] = useState("")

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const end = new Date(contest.end_time)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Contest Ended")
        clearInterval(timer)
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        )
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [contest.end_time])

  return (
    <div className="min-h-screen p-8 page-enter">
      <div className="max-w-6xl mx-auto">
        {/* Contest Header */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold gold-text">{contest.title}</h1>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{timeRemaining}</div>
              <div className="silver-text text-sm">Time Remaining</div>
            </div>
          </div>
          <p className="silver-text mb-4">{contest.description}</p>
          <div className="flex gap-8 text-sm">
            <div>
              <span className="silver-text">Participants: </span>
              <span className="gold-text font-semibold">{contest.participants}</span>
            </div>
            <div>
              <span className="silver-text">Duration: </span>
              <span className="gold-text font-semibold">{contest.duration} minutes</span>
            </div>
            <div>
              <span className="silver-text">Problems: </span>
              <span className="gold-text font-semibold">{contest.problems.length}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-2 flex gap-2">
            {["problems", "leaderboard"].map((tab) => (
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

        {/* Content */}
        {activeTab === "problems" && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold gold-text mb-6">Contest Problems</h2>
            <div className="space-y-4">
              {contest.problems.map((problem, index) => (
                <div key={problem.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold silver-text">{String.fromCharCode(65 + index)}</div>
                    <div className={`w-4 h-4 rounded-full ${problem.solved ? "bg-green-400" : "bg-gray-600"}`} />
                    <div>
                      <Link
                        href={`/editor/${problem.id}?contest=${contestId}`}
                        className="gold-text hover:underline font-semibold"
                      >
                        {problem.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`difficulty-${problem.difficulty}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                        <span className="silver-text text-sm">• {problem.points} points</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/editor/${problem.id}?contest=${contestId}`} className="btn-gold">
                    {problem.solved ? "View Solution" : "Solve"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold gold-text mb-6">Live Leaderboard</h2>
            <div className="space-y-3">
              {contest.leaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-2xl font-bold ${
                        entry.rank === 1
                          ? "gold-text"
                          : entry.rank === 2
                            ? "silver-text"
                            : entry.rank === 3
                              ? "text-orange-300"
                              : "text-gray-400"
                      }`}
                    >
                      #{entry.rank}
                    </div>
                    <div>
                      <div className="gold-text font-semibold">{entry.name}</div>
                      <div className="silver-text text-sm">{entry.problems_solved} problems solved</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="gold-text font-bold text-lg">{entry.score} pts</div>
                    <div className="silver-text text-sm">{entry.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
