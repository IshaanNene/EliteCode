"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("id")

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase.from("problems").select("*").order("id", { ascending: true })

      if (error) throw error

      setProblems(data || [])
    } catch (error) {
      console.error("Error fetching problems:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl super-gold-text sparkle-container">Loading problems...</div>
      </div>
    )
  }

  const categories = [...new Set(problems.map((p) => p.category))]

  const filteredProblems = problems
    .filter((problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter
      const matchesCategory = categoryFilter === "all" || problem.category === categoryFilter
      return matchesSearch && matchesDifficulty && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "difficulty":
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
          return (
            difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
            difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
          )
        case "acceptance":
          return b.acceptance_rate - a.acceptance_rate
        default:
          return a.id - b.id
      }
    })

  return (
    <div className="min-h-screen p-8 page-enter">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold super-gold-text sparkle-container mb-4">Problems</h1>
          <p className="text-xl silver-text">Choose your challenge and start coding</p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
              {problems.filter((p) => p.difficulty === "easy").length} Easy
            </span>
            <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
              {problems.filter((p) => p.difficulty === "medium").length} Medium
            </span>
            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full">
              {problems.filter((p) => p.difficulty === "hard").length} Hard
            </span>
          </div>
        </div>

        <div className="glass-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input p-3 text-white"
            />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="glass-input p-3 text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="glass-input p-3 text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="glass-input p-3 text-white">
              <option value="id">Sort by ID</option>
              <option value="title">Sort by Title</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="acceptance">Sort by Acceptance Rate</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 silver-text font-semibold">#</th>
                  <th className="text-left p-4 silver-text font-semibold">Title</th>
                  <th className="text-left p-4 silver-text font-semibold">Category</th>
                  <th className="text-left p-4 silver-text font-semibold">Difficulty</th>
                  <th className="text-left p-4 silver-text font-semibold">Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr key={problem.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4 silver-text">{problem.id}</td>
                    <td className="p-4">
                      <Link href={`/editor/${problem.id}`} className="gold-text hover:underline font-medium">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="p-4 silver-text">{problem.category}</td>
                    <td className="p-4">
                      <span className={`difficulty-${problem.difficulty}`}>
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 silver-text">{problem.acceptance_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProblems.length === 0 && (
            <div className="text-center py-8">
              <div className="text-xl silver-text">No problems found matching your criteria</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
