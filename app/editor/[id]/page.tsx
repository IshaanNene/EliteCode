"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { fetchWithTimeout, supabase } from "@/lib/supabase"
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
    vector<int> twoSum(vector<int> &nums, int target) {
        // Your code here
    }
};`,
}

export default function EditorPage() {
  const params = useParams()
  const problemId = params.id as string
  const { user } = useAuth()
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [problem, setProblem] = useState<any>(null)
  const [testCases, setTestCases] = useState<any[]>([])

  useEffect(() => {
    async function loadProblem() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await fetchWithTimeout(
          supabase.from("problems").select("*").eq("id", problemId).single()
        )
        if (error || !data) throw new Error("Problem not found")
        setProblem(data)

        // Fetch test cases with timeout
        const { data: tcData, error: tcError } = await fetchWithTimeout(
          supabase.from("problem_test_cases").select("input, expected").eq("problem_id", problemId)
        )
        if (tcError || !tcData) throw new Error("Test cases not found")
        setTestCases(tcData)
      } catch (err: any) {
        setError(err.message || "Failed to load problem")
      } finally {
        setLoading(false)
      }
    }
    loadProblem()
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-400/30'
      case 'hard': return 'bg-red-500/20 text-red-300 border-red-400/30'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/30'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-500/20 text-blue-300 border-blue-400/30',
      'bg-purple-500/20 text-purple-300 border-purple-400/30',
      'bg-pink-500/20 text-pink-300 border-pink-400/30',
      'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    ]
    return colors[category?.length % colors.length] || colors[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
        <span className="ml-4 text-lg font-semibold">Loading problems...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg font-semibold">
          {error} <br />
          Please check your connection or try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex page-enter">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 p-6 border-r border-white/20">
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-2xl p-8 h-full shadow-2xl">
          <div className="problem-details">
            {/* Header Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                {problem.title}
              </h2>
              
              <div className="flex gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${getCategoryColor(problem.category)}`}>
                  {problem.category}
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 text-cyan-200">Problem Description</h3>
              <div className="backdrop-blur-sm bg-white/[0.05] border border-white/10 rounded-xl p-5 text-gray-200 leading-relaxed">
                {problem.description}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              <div className="backdrop-blur-sm bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-300">{problem.acceptance_rate}%</div>
                <div className="text-sm text-green-200">Acceptance Rate</div>
              </div>
              
              <div className="backdrop-blur-sm bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-300">{problem.test_cases?.length || 0}</div>
                <div className="text-sm text-blue-200">Test Cases</div>
              </div>
              
              <div className="backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-purple-300">Judge0</div>
                <div className="text-sm text-purple-200">Powered</div>
              </div>
            </div>

            {/* Examples Section */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-cyan-200">Examples</h3>
                <div className="space-y-3">
                  {problem.examples.map((ex: any, i: number) => (
                    <div key={i} className="backdrop-blur-sm bg-white/[0.05] border border-white/10 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-300 font-medium">Input:</span>
                          <code className="block mt-1 p-2 bg-black/20 rounded text-blue-100">{ex.input}</code>
                        </div>
                        <div>
                          <span className="text-green-300 font-medium">Output:</span>
                          <code className="block mt-1 p-2 bg-black/20 rounded text-green-100">{ex.output}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints Section */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cyan-200">Constraints</h3>
                <div className="backdrop-blur-sm bg-white/[0.05] border border-white/10 rounded-xl p-5">
                  <ul className="space-y-2 text-gray-200">
                    {problem.constraints.map((c: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-yellow-400 mr-3">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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

        {/* Enhanced Execution Results */}
        <div className="p-6 pt-0 max-h-80 overflow-y-auto">
          {testCases.length > 0 && (
            <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                Test Results
              </h3>
              
              <div className="space-y-4">
                {testCases.map((testCase, index) => (
                  <div 
                    key={index} 
                    className={`backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
                      testCase.status === "passed" 
                        ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30" 
                        : "bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-400/30"
                    }`}
                  >
                    {/* Test Case Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${
                          testCase.status === "passed" ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-red-400 shadow-lg shadow-red-400/50"
                        }`}></span>
                        <span className="font-bold text-lg">
                          Test Case {index + 1}
                        </span>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        testCase.status === "passed" 
                          ? "bg-green-400/20 text-green-300 border border-green-400/30" 
                          : "bg-red-400/20 text-red-300 border border-red-400/30"
                      }`}>
                        {testCase.status === "passed" ? "PASSED" : "FAILED"}
                      </div>
                    </div>

                    {/* Test Case Details */}
                    <div className="grid gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="backdrop-blur-sm bg-black/10 border border-white/10 rounded-lg p-3">
                          <div className="text-blue-300 font-medium mb-1">Input:</div>
                          <code className="text-blue-100 break-all">{testCase.input}</code>
                        </div>
                        
                        <div className="backdrop-blur-sm bg-black/10 border border-white/10 rounded-lg p-3">
                          <div className="text-green-300 font-medium mb-1">Expected:</div>
                          <code className="text-green-100 break-all">{testCase.expected}</code>
                        </div>
                        
                        <div className="backdrop-blur-sm bg-black/10 border border-white/10 rounded-lg p-3">
                          <div className={`font-medium mb-1 ${testCase.status === "passed" ? "text-green-300" : "text-red-300"}`}>
                            Your Output:
                          </div>
                          <code className={`break-all ${testCase.status === "passed" ? "text-green-100" : "text-red-100"}`}>
                            {testCase.actual}
                          </code>
                        </div>
                      </div>

                      {/* Runtime and Error Info */}
                      <div className="flex justify-between items-center">
                        <div className="backdrop-blur-sm bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2">
                          <span className="text-yellow-300 font-medium">Runtime:</span>
                          <span className="text-yellow-100 ml-2">{testCase.runtime}ms</span>
                        </div>
                        
                        {testCase.error && (
                          <div className="backdrop-blur-sm bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2 max-w-md">
                            <span className="text-red-300 font-medium">Error:</span>
                            <span className="text-red-200 ml-2 text-sm">{testCase.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}