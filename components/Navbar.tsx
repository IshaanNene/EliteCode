"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function Navbar() {
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold super-gold-text sparkle-container">
            EliteCode
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link href="/problems" className="silver-text hover:gold-text transition-colors">
                  Problems
                </Link>
                <Link href="/contests" className="silver-text hover:gold-text transition-colors">
                  Contests
                </Link>
                <Link href="/leaderboard" className="silver-text hover:gold-text transition-colors">
                  Leaderboard
                </Link>
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 silver-text hover:gold-text transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gold to-silver flex items-center justify-center text-sm font-bold text-black">
                      {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span>{profile?.name || user.email}</span>
                  </Link>
                  <button onClick={handleSignOut} className="btn-silver text-sm px-4 py-2">
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="btn-silver text-sm px-4 py-2">
                  Login
                </Link>
                <Link href="/signup" className="btn-gold text-sm px-4 py-2">
                  Join Elite
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
