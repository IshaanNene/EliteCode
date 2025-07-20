import Image from "next/image"

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/Copilot_20250720_120704.png" // Place your image in /public/Copilot_20250720_120704.png
        alt="EliteCode Logo"
        width={40}
        height={40}
        priority
        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
      />
    </div>
  )
}
