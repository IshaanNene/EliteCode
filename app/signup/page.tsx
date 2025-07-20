"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const [validation, setValidation] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Real-time validation
    setValidation((prev) => ({
      ...prev,
      [name]: value.length > 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const { error } = await signUp(formData.email, formData.password, formData.name)

    if (error) {
      setError(error.message)
    } else {
      setSuccess("Welcome to EliteCode! Check your email to verify your account.")
      setTimeout(() => {
        router.replace("/problems") // Navigate after short delay
      }, 1200)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 page-enter">
      <div className="glass-card p-8 w-full max-w-md border-2 border-gold/30">
        <h1 className="text-4xl font-bold super-gold-text sparkle-container text-center mb-8">Join EliteCode</h1>

        {error && <div className="auth-error">{error}</div>}

        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              className={`glass-input w-full p-4 text-white ${validation.name ? "border-gold shadow-gold" : ""}`}
              required
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className={`glass-input w-full p-4 text-white ${validation.email ? "border-gold shadow-gold" : ""}`}
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`glass-input w-full p-4 text-white ${validation.password ? "border-gold shadow-gold" : ""}`}
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`glass-input w-full p-4 text-white ${
                validation.confirmPassword && formData.password === formData.confirmPassword
                  ? "border-gold shadow-gold"
                  : ""
              }`}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? "Creating Account..." : "Join Elite"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="silver-text">
            Already have an account?{" "}
            <Link href="/login" className="gold-text hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
