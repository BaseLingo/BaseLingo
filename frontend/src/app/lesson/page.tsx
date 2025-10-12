// app/lesson/page.tsx
"use client";

import React, { useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import CompletionMeter from "~/components/CompletionMeter"
import { useRouter } from "next/navigation"

export default function LessonPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [posted, setPosted] = useState(false)
  const [sentence, setSentence] = useState("Wo ist der bahnhof")
  const [isPosting, setIsPosting] = useState(false)
  const day = 9
  const total = 10

  async function handlePost() {
    setIsPosting(true)
    const castText = `Today I learnt the use of the correct article of bahnhoff, for eg I learnt the statement: "${sentence}" #LinguaVault`
    try {
      await sdk.actions.composeCast({
        text: castText,
        embeds: ["https://linguavault.xyz/lesson/9"] as [string],
      })
      if (sdk.haptics) await sdk.haptics.notificationOccurred("success")
      setPosted(true)
    } catch (err) {
      console.error(err)
      alert("Post failed")
    } finally {
      setIsPosting(false)
    }
  }

  async function handleSelectOption(option: string) {
    setSelected(option)
    if (sdk.haptics) {
      await sdk.haptics.selectionChanged()
    }
  }

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-foreground">Daily Lesson</h2>
            <span className="text-sm font-medium text-muted-foreground bg-white border border-border px-3 py-1 rounded-full">
              {day}/{total}
            </span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <p className="text-lg mb-6 text-foreground">
            Fill the blank: <strong className="text-blue-600">Wo ist ___ bahnhof?</strong>
          </p>

          <div className="flex gap-3 mb-6">
            {["der", "die", "das"].map((opt) => (
              <button
                key={opt}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  selected === opt
                    ? opt === "der"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleSelectOption(opt)}
                disabled={posted}
              >
                {opt}
              </button>
            ))}
          </div>

          {selected && (
            <div className="mt-4 pt-4 border-t border-border">
              {selected === "der" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <span className="text-xl">✅</span>
                    <span>Correct!</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your proof sentence (post to Farcaster)
                    </label>
                    <textarea
                      value={sentence}
                      onChange={(e) => setSentence(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      placeholder="Type your sentence here..."
                      disabled={posted}
                    />
                    <button
                      className="w-full mt-3 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={handlePost}
                      disabled={posted || isPosting}
                    >
                      {posted ? "Posted ✓" : isPosting ? "Posting..." : "Post proof to Farcaster"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <span className="text-xl">❌</span>
                  <span>Not quite — try again</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <CompletionMeter completed={posted} />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            ← Home
          </button>
          <button
            onClick={() => router.push("/deposit")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Deposit →
          </button>
        </div>
      </div>
    </div>
  )
}
