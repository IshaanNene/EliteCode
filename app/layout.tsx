import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "EliteCode - Master the Art of Programming",
  description: "A premium coding challenge platform where elite programmers compete and excel",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="holi-background" />
        <div className="glass-overlay" />
        <Navbar />
        <main className="relative z-10 pt-20">{children}</main>
      </body>
    </html>
  )
}
