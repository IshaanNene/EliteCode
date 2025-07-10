"use client"

interface OutputPanelProps {
  output: string
  isRunning: boolean
}

export default function OutputPanel({ output, isRunning }: OutputPanelProps) {
  const getOutputType = (output: string) => {
    if (output.includes("SUCCESSFUL") || output.includes("🎉")) return "success"
    if (output.includes("FAILED") || output.includes("❌")) return "error"
    if (output.includes("Running") || isRunning) return "running"
    return "default"
  }

  const outputType = getOutputType(output)

  const getHeaderIcon = () => {
    switch (outputType) {
      case "success":
        return "✓"
      case "error":
        return "✗"
      case "running":
        return "..."
      default:
        return ">"
    }
  }

  const getHeaderText = () => {
    switch (outputType) {
      case "success":
        return "Execution Successful"
      case "error":
        return "Execution Failed"
      case "running":
        return "Running..."
      default:
        return "Output Console"
    }
  }

  const getTextColor = () => {
    switch (outputType) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "running":
        return "text-yellow-400"
      default:
        return "text-gray-300"
    }
  }

  return (
    <div className="glass-card h-full flex flex-col bg-black/40">
      {/* Output Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getHeaderIcon()}</span>
          <h3 className="silver-text font-semibold">{getHeaderText()}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-gray-900 h-full p-4">
          {output ? (
            <pre className={`text-sm font-mono whitespace-pre-wrap ${getTextColor()}`}>{output}</pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-lg font-semibold mb-2">Ready to Execute</div>
              <div className="text-sm text-center">
                Click "Run" to test your code or "Submit" to submit your solution
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output Footer */}
      <div className="p-3 border-t border-white/20 bg-black/20">
        <div className="flex items-center justify-between text-xs silver-text">
          <div className="flex items-center gap-4">
            <span>Console Output</span>
            {output && (
              <>
                <span>•</span>
                <span>Lines: {output.split("\n").length}</span>
                <span>•</span>
                <span>Characters: {output.length}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>EliteCode Execution Engine</span>
          </div>
        </div>
      </div>
    </div>
  )
}
