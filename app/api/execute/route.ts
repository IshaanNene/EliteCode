import { NextRequest, NextResponse } from 'next/server';
import { JUDGE0_API_URL, languageMap, calculateScore } from '@/lib/code-execution';

export async function POST(req: NextRequest) {
  const { code, language, testCases } = await req.json();
  const languageId = languageMap[language];
  if (!languageId) {
    return NextResponse.json({ success: false, output: `❌ Language '${language}' is not supported by Judge0.` });
  }

  let allPassed = true;
  let output = '';
  let totalRuntime = 0;
  let maxMemory = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const stdin = typeof testCase.input === 'string' ? testCase.input : JSON.stringify(testCase.input);
    const expectedOutput = typeof testCase.expected === 'string' ? testCase.expected : JSON.stringify(testCase.expected);

    const response = await fetch(JUDGE0_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin,
      }),
    });
    const submission = await response.json();

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
      break;
    }
  }

  if (allPassed) {
    output = `🎉 All ${testCases.length} test cases passed!\n\n` + output;
    return NextResponse.json({ success: true, output, runtime: totalRuntime, memory: maxMemory, score: calculateScore(totalRuntime, maxMemory, code.length, language) });
  } else {
    output = `❌ Some test cases failed.\n\n` + output;
    return NextResponse.json({ success: false, output, runtime: totalRuntime, memory: maxMemory });
  }
} 