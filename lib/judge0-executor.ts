import { supabase } from "@/lib/supabase"

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

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
}

const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com"
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_JUDGE0_API_KEY || process.env.JUDGE0_API_KEY

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

    const casesToRun = isSubmission ? testCases : testCases.slice(0, 3)
    const testResults: TestResult[] = []
    let totalRuntime = 0

    const validation = validateCode(code, language)
    if (!validation.valid) {
      return {
        success: false,
        output: `CODE VALIDATION FAILED\n\n${validation.error}`,
        runtime: 0,
        memory: 0,
      }
    }

    const executionTimeout = isSubmission ? 30000 : 15000
    const startTime = Date.now()

    for (let i = 0; i < casesToRun.length; i++) {
      if (Date.now() - startTime > executionTimeout) {
        throw new Error("Execution timeout - please try again")
      }

      const testCase = casesToRun[i]
      const result = await executeTestCaseWithJudge0(code, language, testCase, i + 1)

      testResults.push(result)
      totalRuntime += result.runtime

      if (result.status === "failed" && !isSubmission) {
        break
      }
    }

    const passedTests = testResults.filter((r) => r.status === "passed").length
    const allPassed = passedTests === casesToRun.length
    const avgRuntime = Math.round(totalRuntime / testResults.length)
    const avgMemory = 0

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
      output: `EXECUTION ERROR\n\n${(error as Error).message}`,
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
    const executableCode = prepareCodeForJudge0(code, language, testCase.input)
    const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS]

    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`)
    }

    const submissionToken = await submitToJudge0(executableCode, languageId)

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

// Replace btoa with a robust base64 encoder
function encodeBase64(str: string): string {
  if (typeof window === "undefined") {
    // Node.js
    return Buffer.from(str, "utf-8").toString("base64")
  } else {
    // Browser
    return window.btoa(unescape(encodeURIComponent(str)))
  }
}

async function submitToJudge0(code: string, languageId: number): Promise<string> {
  const payload = {
    language_id: languageId,
    source_code: encodeBase64(code),
    stdin: "",
  }

  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "x-rapidapi-key": RAPIDAPI_KEY ?? "",
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Judge0 submission failed: ${response.statusText || errorText}`)
  }

  const result = await response.json()
  return result.token
}

async function getJudge0Result(token: string, maxAttempts = 15): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=*`, {
      headers: new Headers({
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY ?? "",
      }),
    })

    if (!response.ok) {
      throw new Error(`Judge0 result fetch failed: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.status.id > 2) {
      return {
        ...result,
        stdout: result.stdout ? atob(result.stdout) : "",
        stderr: result.stderr ? atob(result.stderr) : "",
        compile_output: result.compile_output ? atob(result.compile_output) : "",
        message: result.message || "",
        exit_code: result.exit_code,
        exit_signal: result.exit_signal,
        time: result.time,
        wall_time: result.wall_time,
        memory: result.memory,
        status: result.status,
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  throw new Error("Judge0 execution timeout")
}

function extractFunctionName(code: string, language: string): string {
  switch (language) {
    case "javascript":
      const jsMatch =
        code.match(/function\s+(\w+)\s*\(/) ||
        code.match(/const\s+(\w+)\s*=/) ||
        code.match(/let\s+(\w+)\s*=/) ||
        code.match(/var\s+(\w+)\s*=/)
      return jsMatch ? jsMatch[1] : "solution"
    case "python":
      const pyMatch = code.match(/def\s+(\w+)\s*\(/)
      return pyMatch ? pyMatch[1] : "solution"
    case "java":
      const javaMatch = code.match(/public\s+\w+(?:\[\])?\s+(\w+)\s*\(/)
      return javaMatch ? javaMatch[1] : "solution"
    case "cpp":
      const cppMatch =
        code.match(/public:\s*\w+(?:<[^>]*>)?\s+(\w+)\s*\(/) || code.match(/\w+(?:<[^>]*>)?\s+(\w+)\s*$$[^)]*$$\s*{/)
      return cppMatch ? cppMatch[1] : "solution"
    default:
      return "solution"
  }
}

function prepareCodeForJudge0(code: string, language: string, input: any): string {
  const functionName = extractFunctionName(code, language)

  switch (language) {
    case "javascript":
      return `
${code}

// Execute the function with test input
const testInput = ${JSON.stringify(input)};
let result;

try {
  if (Array.isArray(testInput) && testInput.length > 1) {
    result = ${functionName}(testInput[0], testInput[1]);
  } else if (Array.isArray(testInput) && testInput.length === 1) {
    result = ${functionName}(testInput[0]);
  } else {
    result = ${functionName}(testInput);
  }
  console.log(JSON.stringify(result));
} catch (error) {
  console.error("Error:", error.message);
}
`
    case "python":
      return `
import json

${code}

# Execute the function with test input
test_input = ${JSON.stringify(input)}

try:
    if isinstance(test_input, list) and len(test_input) > 1:
        result = ${functionName}(test_input[0], test_input[1])
    elif isinstance(test_input, list) and len(test_input) == 1:
        result = ${functionName}(test_input[0])
    else:
        result = ${functionName}(test_input)
    
    print(json.dumps(result))
except Exception as e:
    print(f"Error: ${`str(e)`.replace(/`/g, "\\`")}")
`
    case "java":
      return `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            
            // Parse test input: ${JSON.stringify(input)}
            ${generateJavaInputParsing(input, functionName)}
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
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
    try {
        Solution sol;
        
        // Parse test input: ${JSON.stringify(input)}
        ${generateCppInputParsing(input, functionName)}
        
    } catch (const exception& e) {
        cout << "Error: " << e.what() << endl;
    }
    
    return 0;
}
`
    default:
      throw new Error(`Unsupported language: ${language}`)
  }
}

function generateJavaInputParsing(input: any, functionName: string): string {
  if (Array.isArray(input) && input.length === 2 && Array.isArray(input[0])) {
    return `
            int[] nums = {${input[0].join(",")}};
            int target = ${input[1]};
            
            int[] result = sol.${functionName}(nums, target);
            
            System.out.print("[");
            for (int i = 0; i < result.length; i++) {
                System.out.print(result[i]);
                if (i < result.length - 1) System.out.print(",");
            }
            System.out.println("]");`
  } else if (Array.isArray(input) && input.length === 1) {
    if (typeof input[0] === "string") {
      return `
            String param = "${input[0]}";
            boolean result = sol.${functionName}(param);
            System.out.println(result);`
    } else if (Array.isArray(input[0])) {
      return `
            int[] nums = {${input[0].join(",")}};
            int result = sol.${functionName}(nums);
            System.out.println(result);`
    }
  }

  return `
            // Generic input handling
            System.out.println("Input format not supported");`
}

function generateCppInputParsing(input: any, functionName: string): string {
  if (Array.isArray(input) && input.length === 2 && Array.isArray(input[0])) {
    return `
        vector<int> nums = {${input[0].join(",")}};
        int target = ${input[1]};
        
        vector<int> result = sol.${functionName}(nums, target);
        
        cout << "[";
        for (int i = 0; i < result.size(); i++) {
            cout << result[i];
            if (i < result.size() - 1) cout << ",";
        }
        cout << "]" << endl;`
  } else if (Array.isArray(input) && input.length === 1) {
    if (typeof input[0] === "string") {
      return `
        string param = "${input[0]}";
        bool result = sol.${functionName}(param);
        cout << (result ? "true" : "false") << endl;`
    } else if (Array.isArray(input[0])) {
      return `
        vector<int> nums = {${input[0].join(",")}};
        int result = sol.${functionName}(nums);
        cout << result << endl;`
    }
  }

  return `
        // Generic input handling
        cout << "Input format not supported" << endl;`
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
  const cleanActual = actual.trim()
  const cleanExpected = expected.trim()

  try {
    const actualParsed = JSON.parse(cleanActual)
    const expectedParsed = JSON.parse(cleanExpected)
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed)
  } catch {
    return cleanActual === cleanExpected
  }
}

function validateCode(code: string, language: string): { valid: boolean; error?: string } {
  const trimmedCode = code.trim()

  if (trimmedCode.length < 10) {
    return { valid: false, error: "Code is too short. Please implement a solution." }
  }

  switch (language) {
    case "javascript":
      if (
        !trimmedCode.includes("function") &&
        !trimmedCode.includes("=>") &&
        !trimmedCode.includes("const") &&
        !trimmedCode.includes("let")
      ) {
        return { valid: false, error: "JavaScript code must contain a function definition." }
      }
      break

    case "python":
      if (!trimmedCode.includes("def ")) {
        return { valid: false, error: "Python code must contain a function definition (def)." }
      }
      break

    case "java":
      if (!trimmedCode.includes("public") || !trimmedCode.includes("class")) {
        return { valid: false, error: "Java code must contain a public class definition." }
      }
      break

    case "cpp":
      if (!trimmedCode.includes("class") && !trimmedCode.includes("struct")) {
        return { valid: false, error: "C++ code must contain a class or struct definition." }
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

  testResults.forEach((result, idx) => {
    output += `Test Case ${result.testCase}: ${result.status === "passed" ? "PASSED" : "FAILED"}\n`
    output += `  Input: ${result.input}\n`
    output += `  Expected: ${result.expected}\n`
    output += `  Your Output: ${result.actual}\n`
    output += `  Runtime: ${result.runtime}ms\n`
    if (result.error) {
      output += `  Error: ${result.error}\n`
    }
    // Diagnostics for failed cases
    if (result.status === "failed") {
      output += `  --- Diagnostics ---\n`
      if (result.error?.includes("Compilation Error")) {
        output += `    • Compilation failed. Check syntax, missing semicolons, or type errors.\n`
      } else if (result.error?.includes("timeout")) {
        output += `    • Time limit exceeded. Optimize your algorithm for better performance.\n`
      } else if (result.error?.includes("Error:")) {
        output += `    • Runtime error. Check for out-of-bounds, null references, or invalid operations.\n`
      } else if (result.error) {
        output += `    • ${result.error}\n`
      } else {
        output += `    • Output did not match expected. Check your logic and edge cases.\n`
      }
      output += `    • Compare your output with the expected output above.\n`
      output += `    • Review function signature and return type.\n`
      output += `    • Try printing intermediate values for debugging.\n`
    }
    output += "\n"
  })

  // Analytics section
  output += `--- Execution Analytics ---\n`
  output += `• Average Runtime: ${avgRuntime}ms\n`
  output += `• Average Memory: ${avgMemory}KB\n`
  output += `• Language: ${language.charAt(0).toUpperCase() + language.slice(1)}\n`
  output += `• Judge0 Status: ${allPassed ? "Accepted" : "Rejected"}\n`
  output += `• ${isSubmission ? "Submission Mode" : "Sample Test Mode"}\n`
  output += `• ${allPassed ? "All test cases passed!" : "Some test cases failed."}\n\n`

  if (allPassed) {
    output += `PERFORMANCE METRICS:\n`
    output += `Average Runtime: ${avgRuntime}ms\n`
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
    output += `• Make sure your function returns the correct data type\n`
    output += `• Review diagnostics above for each failed test case\n\n`
    if (isSubmission) {
      output += `SUBMISSION REJECTED - Please fix the issues and try again.`
    } else {
      output += `Fix the issues above and try submitting when ready.`
    }
  }

  return output
}

/**
 * Fetches a problem by id from Supabase and returns its test_cases array.
 */
export async function fetchProblemTestCases(problemId: number): Promise<any[]> {
  const { data, error } = await supabase
    .from("problems")
    .select("test_cases")
    .eq("id", problemId)
    .single()
  if (error || !data) throw new Error("Problem not found or error fetching test cases")
  return data.test_cases
}

// Usage example (replace previous usage):
// const testCases = await fetchProblemTestCases(problemId);
// await executeCodeWithJudge0(code, language, testCases, isSubmission);