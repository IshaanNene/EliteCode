export async function executeCode(code: string, language: string, testCases: any[]) {
  // Simulate realistic code execution with language-specific behavior
  const delay = (ms: number) => Promise.resolve(setTimeout(() => {}, ms))

  await delay(1000 + Math.random() * 1500) // Random delay 1-2.5 seconds

  // Language-specific validation
  const languageValidation = validateCodeByLanguage(code, language)
  if (!languageValidation.valid) {
    return {
      success: false,
      output: `❌ ${languageValidation.error}`,
      runtime: 0,
      memory: 0,
    }
  }

  // Simulate test case execution
  const results = []
  let passedTests = 0

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const passed = Math.random() > 0.3 // 70% chance of passing each test

    if (passed) {
      passedTests++
      results.push({
        testCase: i + 1,
        status: "✅ PASSED",
        input: JSON.stringify(testCase.input),
        expected: JSON.stringify(testCase.expected),
        actual: JSON.stringify(testCase.expected), // Simulate correct output
        runtime: Math.floor(Math.random() * 50) + 10,
      })
    } else {
      results.push({
        testCase: i + 1,
        status: "❌ FAILED",
        input: JSON.stringify(testCase.input),
        expected: JSON.stringify(testCase.expected),
        actual: generateWrongOutput(testCase.expected),
        runtime: Math.floor(Math.random() * 100) + 20,
      })
      break // Stop at first failure
    }
  }

  const allPassed = passedTests === testCases.length
  const runtime = Math.floor(Math.random() * 200) + 50
  const memory = Math.floor(Math.random() * 20) + 30

  if (allPassed) {
    const score = calculateScore(runtime, memory, code.length, language)
    return {
      success: true,
      output: generateSuccessOutput(results, runtime, memory, language),
      runtime,
      memory,
      score,
    }
  } else {
    return {
      success: false,
      output: generateFailureOutput(results, passedTests, testCases.length),
      runtime: 0,
      memory: 0,
    }
  }
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

function calculateScore(runtime: number, memory: number, codeLength: number, language: string): number {
  // Language-specific scoring multipliers
  const languageMultiplier = {
    javascript: 1.0,
    python: 0.9,
    java: 1.1,
    cpp: 1.2,
  }

  const runtimeScore = Math.max(0, 100 - runtime / 3)
  const memoryScore = Math.max(0, 100 - memory * 2)
  const efficiencyScore = Math.max(0, 100 - codeLength / 15)

  const baseScore = (runtimeScore + memoryScore + efficiencyScore) / 3
  const multiplier = languageMultiplier[language as keyof typeof languageMultiplier] || 1.0

  return Math.floor(baseScore * multiplier)
}
