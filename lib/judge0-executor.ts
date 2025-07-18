export interface ExecutionResult {
  success: boolean
  output: string
  runtime: number
  memory: number
  score?: number
  testResults?: TestResult[]
}

export interface TestResult {
  testCase: number
  status: "passed" | "failed"
  input: string
  expected: string
  actual: string
  runtime: number
  error?: string
}

// Judge0 Language IDs
const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 54, // C++
}

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com"
const RAPIDAPI_KEY = "be0771224amsh4fb869f340a0ab7p127939jsn3ec3b7a57a5b"

export async function executeCodeWithJudge0(
  code: string,
  language: string,
  testCases: any[],
  isSubmission = false,
): Promise<ExecutionResult> {
  try {
    if (!testCases || testCases.length === 0) {
      throw new Error("No test cases available")
    }

    // For submissions, use all test cases; for runs, use first 3
    const casesToRun = isSubmission ? testCases : testCases.slice(0, 3)
    const testResults: TestResult[] = []
    let totalRuntime = 0
    const totalMemory = 0

    // Validate code first
    const validation = validateCode(code, language)
    if (!validation.valid) {
      return {
        success: false,
        output: `❌ CODE VALIDATION FAILED\n\n${validation.error}`,
        runtime: 0,
        memory: 0,
      }
    }

    // Execute each test case
    for (let i = 0; i < casesToRun.length; i++) {
      const testCase = casesToRun[i]
      const result = await executeTestCaseWithJudge0(code, language, testCase, i + 1)

      testResults.push(result)
      totalRuntime += result.runtime

      // Stop on first failure for efficiency (except for submissions where we want to see all failures)
      if (result.status === "failed" && !isSubmission) {
        break
      }
    }

    const passedTests = testResults.filter((r) => r.status === "passed").length
    const allPassed = passedTests === casesToRun.length
    const avgRuntime = Math.round(totalRuntime / testResults.length)
    const avgMemory = Math.round(totalMemory / testResults.length) || 0

    // Calculate score for successful submissions
    let score = 0
    if (allPassed && isSubmission) {
      score = calculateScore(avgRuntime, avgMemory, code.length, language)
    }

    return {
      success: allPassed,
      output: generateExecutionOutput(testResults, avgRuntime, avgMemory, language, isSubmission, allPassed),
      runtime: avgRuntime,
      memory: avgMemory,
      score: allPassed ? score : 0,
      testResults,
    }
  } catch (error) {
    console.error("Judge0 execution error:", error)
    return {
      success: false,
      output: `❌ EXECUTION ERROR\n\n${(error as Error).message}`,
      runtime: 0,
      memory: 0,
    }
  }
}

async function executeTestCaseWithJudge0(
  code: string,
  language: string,
  testCase: any,
  testNumber: number,
): Promise<TestResult> {
  const startTime = Date.now()

  try {
    // Prepare code with test case input
    const executableCode = prepareCodeForJudge0(code, language, testCase.input)
    const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS]

    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`)
    }

    // Submit to Judge0
    const submissionToken = await submitToJudge0(executableCode, languageId, testCase.input)

    // Get result
    const result = await getJudge0Result(submissionToken)

    const runtime = Date.now() - startTime
    const actualOutput = parseJudge0Output(result.stdout, result.stderr)
    const expectedOutput = JSON.stringify(testCase.expected)

    const passed = compareOutputs(actualOutput, expectedOutput)

    return {
      testCase: testNumber,
      status: passed ? "passed" : "failed",
      input: JSON.stringify(testCase.input),
      expected: expectedOutput,
      actual: actualOutput,
      runtime: result.time ? Math.round(result.time * 1000) : runtime,
      error: result.stderr || (result.compile_output ? "Compilation Error" : undefined),
    }
  } catch (error) {
    return {
      testCase: testNumber,
      status: "failed",
      input: JSON.stringify(testCase.input),
      expected: JSON.stringify(testCase.expected),
      actual: "Execution Error",
      runtime: Date.now() - startTime,
      error: (error as Error).message,
    }
  }
}

async function submitToJudge0(code: string, languageId: number, input: any): Promise<string> {
  const payload = {
    language_id: languageId,
    source_code: btoa(code), // Base64 encode
    stdin: btoa(JSON.stringify(input)), // Base64 encode input
    expected_output: null,
  }

  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "x-rapidapi-key": RAPIDAPI_KEY,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Judge0 submission failed: ${response.statusText}`)
  }

  const result = await response.json()
  return result.token
}

async function getJudge0Result(token: string, maxAttempts = 10): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=*`, {
      headers: {
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Judge0 result fetch failed: ${response.statusText}`)
    }

    const result = await response.json()

    // Status ID 1 = In Queue, 2 = Processing
    if (result.status.id > 2) {
      // Decode base64 outputs
      return {
        ...result,
        stdout: result.stdout ? atob(result.stdout) : "",
        stderr: result.stderr ? atob(result.stderr) : "",
        compile_output: result.compile_output ? atob(result.compile_output) : "",
      }
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error("Judge0 execution timeout")
}

function prepareCodeForJudge0(code: string, language: string, input: any): string {
  switch (language) {
    case "javascript":
      return `
${code}

// Read input and execute
const input = ${JSON.stringify(input)};
let result;
if (Array.isArray(input)) {
  result = solution(...input);
} else {
  result = solution(input);
}
console.log(JSON.stringify(result));
`

    case "python":
      return `
${code}

# Read input and execute
import json
import sys

input_data = ${JSON.stringify(input)}
if isinstance(input_data, list):
    result = solution(*input_data)
else:
    result = solution(input_data)
print(json.dumps(result))
`

    case "java":
      return `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        // Parse input for Two Sum problem
        int[] nums = {${input[0].join(",")}};
        int target = ${input[1]};
        
        int[] result = sol.twoSum(nums, target);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i < result.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
}
`

    case "cpp":
      return `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

${code}

int main() {
    Solution sol;
    
    // Parse input for Two Sum problem
    vector<int> nums = {${input[0].join(",")}};
    int target = ${input[1]};
    
    vector<int> result = sol.twoSum(nums, target);
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}
`

    default:
      throw new Error(`Unsupported language: ${language}`)
  }
}

function parseJudge0Output(stdout: string, stderr: string): string {
  if (stderr && stderr.trim()) {
    return `Error: ${stderr.trim()}`
  }

  if (!stdout || !stdout.trim()) {
    return "No output"
  }

  return stdout.trim()
}

function compareOutputs(actual: string, expected: string): boolean {
  try {
    // Try to parse both as JSON for comparison
    const actualParsed = JSON.parse(actual)
    const expectedParsed = JSON.parse(expected)
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed)
  } catch {
    // Fallback to string comparison
    return actual.trim() === expected.trim()
  }
}

function validateCode(code: string, language: string): { valid: boolean; error?: string } {
  const trimmedCode = code.trim()

  if (trimmedCode.length < 10) {
    return { valid: false, error: "Code is too short. Please implement a solution." }
  }

  switch (language) {
    case "javascript":
      if (!trimmedCode.includes("function") && !trimmedCode.includes("=>")) {
        return { valid: false, error: "JavaScript code must contain a function definition." }
      }
      break

    case "python":
      if (!trimmedCode.includes("def ") && !trimmedCode.includes("lambda")) {
        return { valid: false, error: "Python code must contain a function definition (def)." }
      }
      break

    case "java":
      if (!trimmedCode.includes("public") || !trimmedCode.includes("class")) {
        return { valid: false, error: "Java code must contain a public class definition." }
      }
      break

    case "cpp":
      if (!trimmedCode.includes("#include")) {
        return { valid: false, error: "C++ code must include necessary headers." }
      }
      break
  }

  return { valid: true }
}

function calculateScore(runtime: number, memory: number, codeLength: number, language: string): number {
  const languageMultiplier = {
    javascript: 1.0,
    python: 0.9,
    java: 1.1,
    cpp: 1.2,
  }

  const runtimeScore = Math.max(0, 100 - runtime / 10)
  const memoryScore = Math.max(0, 100 - memory / 1024)
  const efficiencyScore = Math.max(0, 100 - codeLength / 20)

  const baseScore = (runtimeScore + memoryScore + efficiencyScore) / 3
  const multiplier = languageMultiplier[language as keyof typeof languageMultiplier] || 1.0

  return Math.floor(baseScore * multiplier)
}

function generateExecutionOutput(
  testResults: TestResult[],
  avgRuntime: number,
  avgMemory: number,
  language: string,
  isSubmission: boolean,
  allPassed: boolean,
): string {
  const passedCount = testResults.filter((r) => r.status === "passed").length
  const totalCount = testResults.length

  let output = `${language.toUpperCase()} EXECUTION ${allPassed ? "SUCCESSFUL" : "FAILED"}\n\n`
  output += `Powered by Judge0 - Real Code Execution\n\n`

  if (isSubmission) {
    output += `SUBMISSION RESULTS: ${passedCount}/${totalCount} test cases passed\n\n`
  } else {
    output += `SAMPLE TEST RESULTS: ${passedCount}/${totalCount} test cases passed\n\n`
  }

  // Show detailed results for each test case
  testResults.forEach((result) => {
    output += `Test Case ${result.testCase}: ${result.status === "passed" ? "PASSED" : "FAILED"}\n`
    output += `  Input: ${result.input}\n`
    output += `  Expected: ${result.expected}\n`
    output += `  Your Output: ${result.actual}\n`
    output += `  Runtime: ${result.runtime}ms\n`
    if (result.error) {
      output += `  Error: ${result.error}\n`
    }
    output += "\n"
  })

  if (allPassed) {
    output += `All test cases passed!\n\n`
    output += `PERFORMANCE METRICS:\n`
    output += `Average Runtime: ${avgRuntime}ms\n`
    output += `Memory Usage: ${avgMemory}KB\n`
    output += `Language: ${language.charAt(0).toUpperCase() + language.slice(1)}\n`
    output += `Executed on Judge0 servers\n`

    if (isSubmission) {
      output += `\nSUBMISSION ACCEPTED - Solution saved to database!`
    }
  } else {
    output += `DEBUGGING HINTS:\n`
    const failedTest = testResults.find((r) => r.status === "failed")
    if (failedTest?.error) {
      output += `• ${failedTest.error}\n`
    }
    output += `• Check your logic for edge cases\n`
    output += `• Verify your algorithm handles all input scenarios\n`
    output += `• Make sure your function returns the correct data type\n\n`

    if (isSubmission) {
      output += `SUBMISSION REJECTED - Please fix the issues and try again.`
    } else {
      output += `Fix the issues above and try submitting when ready.`
    }
  }

  return output
}
