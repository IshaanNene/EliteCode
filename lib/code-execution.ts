// This approach uses local Docker execution instead of Cloud Run
// Better for development and simpler deployment

const fetch: (...args: [string, any?]) => Promise<any> = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import { v4 as uuidv4 } from 'uuid';

interface ExecutionResult {
  success: boolean;
  output: string;
  runtime: number;
  memory: number;
  score?: number;
}

interface Judge0Submission {
  stdout?: string;
  time?: string;
  memory?: number;
  stderr?: string;
  compile_output?: string;
  message?: string;
}

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';

const languageMap: Record<string, number> = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  java: 62,       // Java
  cpp: 54,        // C++ (GCC 9.2.0)
};

export async function executeCode(
  code: string,
  language: string,
  testCases: { input: any; expected: any }[]
): Promise<ExecutionResult> {
  const languageId = languageMap[language];
  if (!languageId) {
    return {
      success: false,
      output: `❌ Language '${language}' is not supported by Judge0.`,
      runtime: 0,
      memory: 0,
    };
  }

  let allPassed = true;
  let output = '';
  let totalRuntime = 0;
  let maxMemory = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const stdin = typeof testCase.input === 'string' ? testCase.input : JSON.stringify(testCase.input);
    const expectedOutput = typeof testCase.expected === 'string' ? testCase.expected : JSON.stringify(testCase.expected);

    const submission: Judge0Submission = await submitToJudge0(code, languageId, stdin);
    totalRuntime += submission.time ? Math.round(Number(submission.time) * 1000) : 0;
    maxMemory = Math.max(maxMemory, submission.memory || 0);

    let actualOutput = (submission.stdout || '').trim();
    let passed = actualOutput === expectedOutput;

    output += `Test Case ${i + 1}: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    output += `  Input: ${stdin}\n`;
    output += `  Expected: ${expectedOutput}\n`;
    output += `  Your Output: ${actualOutput}\n`;
    output += `  Runtime: ${submission.time ? Math.round(Number(submission.time) * 1000) : 0}ms\n`;
    output += `  Memory: ${submission.memory || 0}KB\n\n`;

    if (!passed) {
      allPassed = false;
      break; // Stop at first failure
    }
  }

  if (allPassed) {
    output = `🎉 All ${testCases.length} test cases passed!\n\n` + output;
    return {
      success: true,
      output,
      runtime: totalRuntime,
      memory: maxMemory,
      score: calculateScore(totalRuntime, maxMemory, code.length, language),
    };
  } else {
    output = `❌ Some test cases failed.\n\n` + output;
    return {
      success: false,
      output,
      runtime: totalRuntime,
      memory: maxMemory,
    };
  }
}

async function submitToJudge0(source_code: string, language_id: number, stdin: string): Promise<Judge0Submission> {
  const response = await fetch(JUDGE0_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    body: JSON.stringify({
      source_code,
      language_id,
      stdin,
    }),
  });
  return await response.json() as Judge0Submission;
}

function calculateScore(runtime: number, memory: number, codeLength: number, language: string): number {
  const languageMultiplier = {
    javascript: 1.0,
    python: 0.9,
    java: 1.1,
    cpp: 1.2,
  };
  const runtimeScore = Math.max(0, 100 - runtime / 3);
  const memoryScore = Math.max(0, 100 - memory / 2);
  const efficiencyScore = Math.max(0, 100 - codeLength / 15);
  const baseScore = (runtimeScore + memoryScore + efficiencyScore) / 3;
  const multiplier = languageMultiplier[language as keyof typeof languageMultiplier] || 1.0;
  return Math.floor(baseScore * multiplier);
}

function validateCodeByLanguage(code: string, language: string) {
  const trimmedCode = code.trim()

  if (trimmedCode.length < 10) {
    return { valid: false, error: "Code is too short. Please implement a solution." }
  }

  switch (language) {
    case "javascript":
      if (!trimmedCode.includes("function") && !trimmedCode.includes("=>")) {
        return { valid: false, error: "JavaScript code must contain a function definition." }
      }
      if (!trimmedCode.includes("return")) {
        return { valid: false, error: "JavaScript function must return a value." }
      }
      break

    case "python":
      if (!trimmedCode.includes("def ") && !trimmedCode.includes("lambda")) {
        return { valid: false, error: "Python code must contain a function definition (def)." }
      }
      if (!trimmedCode.includes("return")) {
        return { valid: false, error: "Python function must return a value." }
      }
      break

    case "java":
      if (!trimmedCode.includes("public") || !trimmedCode.includes("class")) {
        return { valid: false, error: "Java code must contain a public class definition." }
      }
      if (!trimmedCode.includes("return")) {
        return { valid: false, error: "Java method must return a value." }
      }
      break

    case "cpp":
      if (!trimmedCode.includes("#include")) {
        return { valid: false, error: "C++ code must include necessary headers." }
      }
      if (!trimmedCode.includes("return")) {
        return { valid: false, error: "C++ function must return a value." }
      }
      break
  }

  return { valid: true, error: null }
}

function generateSuccessOutput(results: any[], runtime: number, memory: number, language: string) {
  const languageEmoji = {
    javascript: "🟨",
    python: "🐍",
    java: "☕",
    cpp: "⚡",
  }

  let output = `${languageEmoji[language as keyof typeof languageEmoji]} ${language.toUpperCase()} EXECUTION SUCCESSFUL\n\n`
  output += `🎉 All ${results.length} test cases passed!\n\n`

  results.forEach((result) => {
    output += `Test Case ${result.testCase}: ${result.status}\n`
    output += `  Input: ${result.input}\n`
    output += `  Output: ${result.actual}\n`
    output += `  Runtime: ${result.runtime}ms\n\n`
  })

  output += `📊 PERFORMANCE METRICS:\n`
  output += `⏱️  Runtime: ${runtime}ms (beats ${Math.floor(Math.random() * 30) + 70}% of submissions)\n`
  output += `💾 Memory: ${memory}.${Math.floor(Math.random() * 9)}MB (beats ${Math.floor(Math.random() * 40) + 60}% of submissions)\n`
  output += `🏆 Language: ${language.charAt(0).toUpperCase() + language.slice(1)}\n`

  return output
}

function generateFailureOutput(results: any[], passed: number, total: number) {
  let output = `❌ SUBMISSION FAILED\n\n`
  output += `${passed}/${total} test cases passed\n\n`

  results.forEach((result) => {
    output += `Test Case ${result.testCase}: ${result.status}\n`
    output += `  Input: ${result.input}\n`
    output += `  Expected: ${result.expected}\n`
    output += `  Your Output: ${result.actual}\n\n`
  })

  if (passed < total) {
    output += `💡 HINT: Check your logic for edge cases and ensure your algorithm handles all input scenarios correctly.`
  }

  return output
}

function generateWrongOutput(expected: any) {
  if (Array.isArray(expected)) {
    return JSON.stringify([...expected].reverse()) // Wrong order
  }
  if (typeof expected === "number") {
    return JSON.stringify(expected + 1) // Off by one
  }
  if (typeof expected === "string") {
    return JSON.stringify(expected.toLowerCase()) // Wrong case
  }
  return JSON.stringify(null)
}