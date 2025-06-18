import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 page-enter">
      <div className="text-center space-y-8">
        <h1 className="text-8xl font-bold super-gold-text sparkle-container mb-4">EliteCode</h1>
        <p className="text-2xl silver-text mb-12">Master the Art of Programming</p>
        <div className="flex gap-6 justify-center">
          <Link href="/signup" className="btn-gold">
            Join Elite
          </Link>
          <Link href="/login" className="btn-silver">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
