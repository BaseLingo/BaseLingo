// components/CompletionMeter.tsx
"use client";

import React, { useEffect, useState } from "react"

export default function CompletionMeter({ completed }: { completed: boolean }) {
  const [showParty, setShowParty] = useState(false)

  useEffect(() => {
    if (completed) {
      setShowParty(true)
      const t = setTimeout(() => setShowParty(false), 4000)
      return () => clearTimeout(t)
    }
  }, [completed])

  return (
    <div className="relative">
      <div className="mb-4 text-center">
        <p className="text-lg font-display font-bold text-duolingo-green mb-2">📈 Your Progress</p>
        <p className="text-sm text-gray-600">Complete lessons to unlock earnings!</p>
      </div>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-duolingo-green/20">
        <div
          style={{ width: completed ? "100%" : "45%" }}
          className="duolingo-progress h-4 transition-all duration-700 ease-out"
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-semibold text-gray-600">0%</span>
        <span className="text-sm font-semibold text-duolingo-green">{completed ? "100%" : "45%"} Complete</span>
        <span className="text-sm font-semibold text-gray-600">100%</span>
      </div>
      {showParty && (
        <div className="mt-6 text-center">
          <div className="text-6xl animate-bounce inline-block" aria-hidden>
            🎉
          </div>
          <p className="text-2xl font-display font-bold text-duolingo-green mt-2">Lesson Complete!</p>
          <p className="text-sm text-gray-600 mt-1">Great job! You&apos;re earning rewards! 💰</p>
        </div>
      )}
    </div>
  )
}
