"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { executeCodeWithJudge0 } from "@/lib/judge0-executor"
import CodeEditor from "@/components/CodeEditor"
import OutputPanel from "@/components/OutputPanel"

const DEFAULT_TEMPLATES = {
  javascript: `function solution() {
    // Your code here
    
}`,
  python: `def solution():
    # Your code here
    pass`,
  java: `public class Solution {
    public void solution() {
        // Your code here
        
    }
}`,
  cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    // Example for Two Sum problem
    vector<int> solution(vector<int>& nums, int target) {
        // Your code here
        
        return {};
    }
};`,
}

export default function EditorPage() {
  const params = useParams()
  const problemId = params.id as string
  const { user } = useAuth()
  const [problem, setProblem] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("description")
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProblem()
  }, [problemId])

  useEffect(() => {
    // Update code template when language changes
    if (problem && problem.starter_code) {
      const starterCode =
        problem.starter_code[language] || DEFAULT_TEMPLATES[language as keyof typeof DEFAULT_TEMPLATES]
      setCode(starterCode)
    } else {
      setCode(DEFAULT_TEMPLATES[language as keyof typeof DEFAULT_TEMPLATES])
    }
  }, [language, problem])

  const fetchProblem = async () => {
    try {
      const { data, error } = await supabase.from("problems").select("*").eq("id", problemId).single()

      if (error) throw error

      setProblem(data)

      // Set initial code based on the starter_code from database
      if (data.starter_code && data.starter_code.javascript) {
        setCode(data.starter_code.javascript)
      } else {
        setCode(DEFAULT_TEMPLATES.javascript)
      }
    } catch (error) {
      console.error("Error fetching problem:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRun = async () => {
    if (!problem || !problem.test_cases) {
      setOutput("ERROR: Problem test cases not loaded")
      return
    }

    setIsRunning(true)
    setOutput("Connecting to Judge0 servers...\nCompiling and executing code...\nRunning test cases...")

    try {
      // Use first 3 test cases for run
      const result = await executeCodeWithJudge0(code, language, problem.test_cases.slice(0, 3), false)
      setOutput(result.output)
    } catch (error) {
      console.error("Run error:", error)
      setOutput(`EXECUTION ERROR\n\n${(error as Error).message}`)
    }

    setIsRunning(false)
  }

  const handleSubmit = async () => {
    if (!problem || !problem.test_cases) {
      setOutput("ERROR: Problem test cases not loaded")
      return
    }

    if (!user) {
      setOutput("AUTHENTICATION ERROR\n\nPlease log in to submit your solution to EliteCode.")
      return
    }

    setIsRunning(true)
    setOutput(
      "Submitting solution to EliteCode...\nConnecting to Judge0 servers...\nRunning comprehensive test suite...",
    )

    try {
      // Use the same method as run, just with all test cases
      // Add a timeout for Judge0 execution (e.g. 30 seconds for all test cases)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Judge0 execution timeout (too many test cases or slow server)")), 30000)
      )
      const execPromise = executeCodeWithJudge0(code, language, problem.test_cases, true)
      const result = await Promise.race([execPromise, timeoutPromise]) as {
        success: boolean
        output: string
        runtime?: number
        memory?: number
        score?: number
      }

      const submission = {
        user_id: user.id,
        problem_id: Number.parseInt(problemId),
        code: code,
        language: language,
        status: result.success ? "accepted" : "wrong_answer",
        runtime: result.runtime || null,
        memory: result.memory || null,
        score: result.score || null,
      }

      const { error: submissionError } = await supabase.from("submissions").insert(submission)

      if (submissionError) {
        console.error("Error saving submission:", submissionError)
        setOutput(result.output + "\n\nNote: Execution completed but submission may not have been saved to database.")
      } else {
        setOutput(result.output)
      }
    } catch (error) {
      console.error("Submit error:", error)
      setOutput(`SUBMISSION ERROR\n\n${(error as Error).message}`)
    }

    setIsRunning(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl super-gold-text sparkle-container">Loading problem...</div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl super-gold-text mb-4">Problem Not Found</div>
          <div className="text-xl silver-text">The requested problem could not be loaded.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex page-enter">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 p-6 border-r border-white/20">
        <div className="glass-card p-6 h-full">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold super-gold-text sparkle-container">{problem.title}</h1>
            <span className={`difficulty-${problem.difficulty}`}>
              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
            </span>
            <span className="text-sm silver-text bg-black/20 px-3 py-1 rounded-full">{problem.category}</span>
          </div>

          <div className="flex gap-4 mb-6">
            {["description", "examples", "constraints"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 border-b-2 transition-colors ${
                  activeTab === tab ? "border-gold gold-text" : "border-transparent silver-text hover:gold-text"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4 overflow-y-auto max-h-96">
            {activeTab === "description" && <div className="silver-text leading-relaxed">{problem.description}</div>}

            {activeTab === "examples" && (
              <div className="space-y-4">
                {problem.examples?.map((example: any, index: number) => (
                  <div key={index} className="bg-black/20 p-4 rounded-lg">
                    <div className="gold-text font-semibold mb-2">Example {index + 1}:</div>
                    <div className="silver-text space-y-1">
                      <div>
                        <strong>Input:</strong> {example.input}
                      </div>
                      <div>
                        <strong>Output:</strong> {example.output}
                      </div>
                      {example.explanation && (
                        <div>
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "constraints" && (
              <div className="space-y-2">
                {problem.constraints?.map((constraint: string, index: number) => (
                  <div key={index} className="silver-text">
                    • {constraint}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Problem Stats */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span className="silver-text">Acceptance Rate:</span>
              <span className="gold-text font-semibold">{problem.acceptance_rate}%</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="silver-text">Test Cases:</span>
              <span className="gold-text font-semibold">{problem.test_cases?.length || 0} total</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="silver-text">Execution:</span>
              <span className="gold-text font-semibold">Judge0 Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Code Editor and Output */}
      <div className="w-1/2 flex flex-col">
        {/* Code Editor */}
        <div className="flex-1 p-6">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isRunning={isRunning}
          />
        </div>

        {/* Output Panel */}
        <div className="h-64 p-6 pt-0">
          <OutputPanel output={output} isRunning={isRunning} />
        </div>
      </div>
    </div>
  )
}