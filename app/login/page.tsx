"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      router.replace("/problems") // Use replace for smoother navigation, no reload
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 page-enter">
      <div className="glass-card p-8 w-full max-w-md border-2 border-gold/30">
        <h1 className="text-4xl font-bold super-gold-text sparkle-container text-center mb-8">Welcome Back</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full p-4 text-white"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full p-4 text-white"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="silver-text">
            {"Don't have an account? "}
            <Link href="/signup" className="gold-text hover:underline">
              Join EliteCode
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
