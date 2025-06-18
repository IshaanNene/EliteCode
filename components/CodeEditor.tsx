"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  onLanguageChange: (language: string) => void
  onRun: () => void
  onSubmit: () => void
  isRunning: boolean
}

const LANGUAGE_CONFIGS = {
  javascript: {
    name: "JavaScript",
    icon: "🟨",
    extension: ".js",
    template: `function solution(/* parameters */) {
    // Your code here
    
    return result;
}`,
  },
  python: {
    name: "Python",
    icon: "🐍",
    extension: ".py",
    template: `def solution(/* parameters */):
    # Your code here
    
    return result`,
  },
  java: {
    name: "Java",
    icon: "☕",
    extension: ".java",
    template: `public class Solution {
    public /* return_type */ solution(/* parameters */) {
        // Your code here
        
        return result;
    }
}`,
  },
  cpp: {
    name: "C++",
    icon: "⚡",
    extension: ".cpp",
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    /* return_type */ solution(/* parameters */) {
        // Your code here
        
        return result;
    }
};`,
  },
}

export default function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  isRunning,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineNumbers, setLineNumbers] = useState<number[]>([])

  useEffect(() => {
    updateLineNumbers()
  }, [value])

  const updateLineNumbers = () => {
    const lines = value.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      const newValue = value.substring(0, start) + "    " + value.substring(end)
      onChange(newValue)

      // Set cursor position after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4
      }, 0)
    }

    // Auto-closing brackets
    if (e.key === "{" || e.key === "(" || e.key === "[") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      const closingChar = e.key === "{" ? "}" : e.key === "(" ? ")" : "]"
      const newValue = value.substring(0, start) + e.key + closingChar + value.substring(end)
      onChange(newValue)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      }, 0)
    }
  }

  const currentConfig = LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS]

  return (
    <div className="glass-card h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center gap-4">
          <h3 className="super-gold-text font-semibold flex items-center gap-2">
            <span className="text-2xl">💻</span>
            Code Editor
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentConfig.icon}</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="glass-input px-3 py-2 text-sm font-semibold"
            >
              {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm silver-text">
            Lines: {lineNumbers.length} | Chars: {value.length}
          </div>
          <button onClick={onRun} disabled={isRunning} className="btn-silver text-sm px-4 py-2 flex items-center gap-2">
            <span>▶️</span>
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            onClick={onSubmit}
            disabled={isRunning}
            className="btn-gold text-sm px-4 py-2 flex items-center gap-2"
          >
            <span>🚀</span>
            {isRunning ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex">
        {/* Line Numbers */}
        <div className="bg-gray-800 text-gray-400 text-sm font-mono p-4 pr-2 select-none border-r border-gray-600">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6 text-right">
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-gray-900 text-white resize-none outline-none p-4 font-mono text-sm leading-6"
            style={{
              fontFamily: "Monaco, Menlo, 'Fira Code', 'Courier New', monospace",
              tabSize: 4,
            }}
            spellCheck={false}
            placeholder={`Start coding in ${currentConfig.name}...`}
          />

          {/* Syntax highlighting overlay (simplified) */}
          <div className="absolute inset-0 pointer-events-none p-4 font-mono text-sm leading-6 opacity-0">
            {/* This would contain syntax highlighted version in a real implementation */}
          </div>
        </div>
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between p-3 border-t border-white/20 bg-black/20">
        <div className="flex items-center gap-4 text-sm silver-text">
          <span>Language: {currentConfig.name}</span>
          <span>•</span>
          <span>Tab Size: 4</span>
          <span>•</span>
          <span>Encoding: UTF-8</span>
        </div>
        <div className="flex items-center gap-2 text-sm silver-text">
          <span>💡</span>
          <span>Press Tab for indentation, Ctrl+/ for comments</span>
        </div>
      </div>
    </div>
  )
}
