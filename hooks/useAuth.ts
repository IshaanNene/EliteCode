"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth error:", error.message)
        }

        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error("Auth initialization failed:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      if (mounted) {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error && error.code === "PGRST116") {
        // User profile doesn't exist, create one
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const newProfile = {
            id: userData.user.id,
            email: userData.user.email!,
            name: userData.user.user_metadata?.name || userData.user.email!.split("@")[0],
            problems_solved: 0,
            total_score: 0,
            rank: 0,
          }

          const { data: createdProfile, error: createError } = await supabase
            .from("users")
            .insert(newProfile)
            .select()
            .single()

          if (!createError && createdProfile) {
            setProfile(createdProfile)
          }
        }
      } else if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    // Create user profile
    if (data.user && !error) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email!,
        name: name,
        problems_solved: 0,
        total_score: 0,
        rank: 0,
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
      }
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: any) => {
    if (!user) return { error: { message: "No user logged in" } }

    const { data, error } = await supabase.from("users").update(updates).eq("id", user.id).select().single()

    if (!error && data) {
      setProfile(data)
    }

    return { data, error }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchUserProfile,
  }
}
