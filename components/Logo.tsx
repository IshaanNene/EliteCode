import Image from "next/image"

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="public/Copilot_20250720_120704.png" // Place your image in /public/logo.png
        alt="EliteCode Logo"
        width={400}
        height={200}
        priority
        style={{ width: "100%", height: "auto", borderRadius: "1rem" }}
      />
    </div>
  )
}
