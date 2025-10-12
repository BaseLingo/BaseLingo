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
      <div className="mb-2">
        <p className="text-sm font-medium text-muted-foreground mb-1">Progress</p>
      </div>
      <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
        <div
          style={{ width: completed ? "100%" : "45%" }}
          className="h-3 bg-gradient-to-r from-red-500 to-yellow-400 transition-all duration-500 ease-out"
        />
      </div>
      {showParty && (
        <div className="mt-4 text-center">
          <div className="text-5xl animate-bounce inline-block" aria-hidden>
            🎉
          </div>
          <p className="text-green-600 font-bold mt-2">Lesson Complete!</p>
        </div>
      )}
    </div>
  )
}
