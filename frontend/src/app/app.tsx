"use client";

import dynamic from "next/dynamic";
import { useMiniKit, useQuickAuth } from '@coinbase/onchainkit/minikit';
import { useEffect, useState, useCallback } from 'react';
import { useSignMessage, useAccount, useReconnect, useDisconnect } from "wagmi"
import { config } from "~/components/providers/WagmiProvider"
import { sdk } from "@farcaster/miniapp-sdk"
import { saveDeposit, loadDeposit, computeWithdrawable } from "~/lib/storage"
import CompletionMeter from "~/components/CompletionMeter"
import { truncateAddress } from "~/lib/truncateAddress"

const Demo = dynamic(() => import("~/components/Demo"), {
  ssr: false,
});

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

type TabType = "learn" | "earn" | "wallet";

export default function App() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const [showDemo, setShowDemo] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("earn");

  // Lesson state
  const [selected, setSelected] = useState<string | null>(null)
  const [posted, setPosted] = useState(false)
  const [sentence, setSentence] = useState("Wo ist der bahnhof")
  const [isPosting, setIsPosting] = useState(false)
  const day = 9
  const total = 10

  // Deposit/Earn state
  const [current, setCurrent] = useState<ReturnType<typeof loadDeposit>>(null)
  const [amount, setAmount] = useState<number>(10)
  const [loading, setLoading] = useState(false)

  // Wallet state
  const { signMessageAsync } = useSignMessage()
  const { isConnected, address } = useAccount()
  const { reconnect } = useReconnect()
  const { disconnect } = useDisconnect()

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    // Load deposit only on client side
    setCurrent(loadDeposit())

    // Try to reconnect the Farcaster miniapp connector on mount
    if (!isConnected) {
      reconnect({ connectors: [config.connectors[0]] })
    }
  }, [isConnected, reconnect])

  useQuickAuth<AuthResponse>(
    "/api/auth",
    { method: "GET" }
  );

  const handleTabChange = async (tab: TabType) => {
    if (sdk.haptics) {
      await sdk.haptics.selectionChanged()
    }
    setActiveTab(tab)
  }

  // Lesson handlers
  const handleSelectOption = useCallback(async (option: string) => {
    setSelected(option)
    if (sdk.haptics) {
      await sdk.haptics.selectionChanged()
    }
  }, [])

  const handlePost = useCallback(async () => {
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
  }, [sentence])

  // Earn/Deposit handlers
  const handleDeposit = useCallback(async () => {
    setLoading(true)
    const msg = `I deposit ${amount} euros`
    try {
      const sig = await signMessageAsync({ message: msg })
      console.log("Signed deposit:", sig)
      const depositState = { amount, depositedAt: new Date().toISOString() }
      saveDeposit(depositState)
      setCurrent(depositState)
      if (sdk.haptics) await sdk.haptics.notificationOccurred("success")
      setActiveTab("learn") // Switch to learn tab after deposit
    } catch (err) {
      console.error(err)
      alert("Sign failed - please ensure you're in the Farcaster miniapp")
    } finally {
      setLoading(false)
    }
  }, [amount, signMessageAsync])

  const handleWithdraw = useCallback(async () => {
    if (!current) return
    const withdrawable = computeWithdrawable(current)
    const msg = `Withdrawing ${withdrawable} euros`
    try {
      const sig = await signMessageAsync({ message: msg })
      console.log("Signed withdraw:", sig)
      saveDeposit(null)
      setCurrent(null)
      if (sdk.haptics) await sdk.haptics.notificationOccurred("success")
      alert(`Withdrew ${withdrawable} € (mock)`)
    } catch (err) {
      console.error(err)
      alert("Withdraw sign failed - please ensure you're in the Farcaster miniapp")
    }
  }, [current, signMessageAsync])

  const withdrawable = computeWithdrawable(current)

  if (showDemo) {
    return <Demo />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-duolingo-green/5 via-white to-duolingo-blue/5">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl">
        {/* Header with Duolingo-style branding */}
        <div className="bg-gradient-to-r from-duolingo-green to-duolingo-green/90 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🦉</span>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">BaseLingo</h1>
                <p className="text-sm opacity-90">Learn & Earn on Base</p>
              </div>
            </div>
            <div className="duolingo-streak">
              🔥 Day {day}
            </div>
          </div>
        </div>

        {/* Tab Navigation with Duolingo-style */}
        <div className="bg-white border-b-2 border-duolingo-green/20">
          <div className="flex">
            <button
              onClick={() => handleTabChange("earn")}
              className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                activeTab === "earn"
                  ? "text-duolingo-green border-b-3 border-duolingo-green bg-duolingo-green/5"
                  : "text-gray-500 hover:text-duolingo-green hover:bg-duolingo-green/5"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="text-lg">💰</span>
                <span>Earn</span>
              </span>
            </button>
            <button
              onClick={() => handleTabChange("learn")}
              className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                activeTab === "learn"
                  ? "text-duolingo-green border-b-3 border-duolingo-green bg-duolingo-green/5"
                  : "text-gray-500 hover:text-duolingo-green hover:bg-duolingo-green/5"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="text-lg">📚</span>
                <span>Learn</span>
              </span>
            </button>
            <button
              onClick={() => handleTabChange("wallet")}
              className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                activeTab === "wallet"
                  ? "text-duolingo-green border-b-3 border-duolingo-green bg-duolingo-green/5"
                  : "text-gray-500 hover:text-duolingo-green hover:bg-duolingo-green/5"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="text-lg">👛</span>
                <span>Wallet</span>
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-gradient-to-b from-white to-duolingo-green/5 min-h-[calc(100vh-200px)]">
          {/* EARN TAB */}
          {activeTab === "earn" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2 text-duolingo-green">💰 Earn & Withdraw</h2>
                <p className="text-gray-600">Complete lessons to unlock your earnings!</p>
              </div>

              {/* Progress Meter */}
              <div className="duolingo-card p-6">
                <CompletionMeter completed={posted} />
              </div>

              {/* Deposit/Withdraw Section */}
              <div className="duolingo-card p-6 space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">💰 Current Balance</p>
                  <p className="text-4xl font-display font-bold text-duolingo-green">
                    {current ? `${current.amount} €` : "0.00 €"}
                  </p>
                </div>

                {current ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-duolingo-green/10 to-duolingo-blue/10 p-4 rounded-xl border-2 border-duolingo-green/20">
                      <p className="text-sm text-gray-600 mb-1">🎯 Withdrawable Amount</p>
                      <p className="text-3xl font-display font-bold text-duolingo-green">{withdrawable} €</p>
                      <p className="text-xs text-gray-500 mt-1">+3% yield earned!</p>
                    </div>
                    <button
                      className="duolingo-button w-full"
                      onClick={handleWithdraw}
                    >
                      💸 Withdraw {withdrawable} €
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">💳 Make a Deposit</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          💰 Amount (€)
                        </label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full px-6 py-4 border-2 border-duolingo-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-duolingo-green focus:border-duolingo-green text-center text-2xl font-bold"
                          min="1"
                          placeholder="10"
                        />
                      </div>
                    </div>
                    <button
                      className="duolingo-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleDeposit}
                      disabled={loading}
                    >
                      {loading ? "⏳ Signing..." : `💰 Deposit ${amount} €`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEARN TAB */}
          {activeTab === "learn" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2 text-duolingo-green">📚 Daily Lesson</h2>
                <div className="flex items-center justify-center space-x-4">
                  <div className="duolingo-streak">
                    🔥 Day {day}
                  </div>
                  <div className="bg-duolingo-blue/10 text-duolingo-blue px-4 py-2 rounded-full font-semibold">
                    {day}/{total} Complete
                  </div>
                </div>
              </div>

              <div className="duolingo-card p-6">
                <div className="text-center mb-8">
                  <p className="text-2xl font-display font-bold text-gray-800 mb-4">
                    Fill in the blank:
                  </p>
                  <div className="bg-gradient-to-r from-duolingo-green/10 to-duolingo-blue/10 p-6 rounded-2xl border-2 border-duolingo-green/20">
                    <p className="text-3xl font-display font-bold text-duolingo-green">
                      Wo ist <span className="bg-duolingo-yellow/30 px-2 py-1 rounded">___</span> bahnhof?
                    </p>
                    <p className="text-sm text-gray-600 mt-2">German Article Practice</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {["der", "die", "das"].map((opt) => (
                    <button
                      key={opt}
                      className={`py-4 px-6 rounded-2xl font-display font-bold text-lg transition-all transform hover:scale-105 ${
                        selected === opt
                          ? opt === "der"
                            ? "bg-duolingo-green text-white shadow-lg scale-105"
                            : "bg-duolingo-red text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-duolingo-green/10 hover:text-duolingo-green border-2 border-gray-200"
                      }`}
                      onClick={() => handleSelectOption(opt)}
                      disabled={posted}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {selected && (
                  <div className="mt-8 pt-6 border-t-2 border-duolingo-green/20">
                    {selected === "der" ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-duolingo-green rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✅</span>
                          </div>
                          <h3 className="text-2xl font-display font-bold text-duolingo-green mb-2">Perfect! 🎉</h3>
                          <p className="text-gray-600">You got it right! Now share your progress.</p>
                        </div>
                        <div className="duolingo-card p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            📝 Your proof sentence (post to Farcaster)
                          </label>
                          <textarea
                            value={sentence}
                            onChange={(e) => setSentence(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-duolingo-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-duolingo-green focus:border-duolingo-green min-h-[100px] resize-none"
                            placeholder="Type your sentence here..."
                            disabled={posted}
                          />
                          <button
                            className="w-full mt-4 duolingo-button disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handlePost}
                            disabled={posted || isPosting}
                          >
                            {posted ? "✅ Posted to Farcaster!" : isPosting ? "⏳ Posting..." : "📱 Post proof to Farcaster"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-duolingo-red rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">❌</span>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-duolingo-red mb-2">Not quite right</h3>
                        <p className="text-gray-600 mb-4">Try again! You&apos;ve got this! 💪</p>
                        <button
                          onClick={() => setSelected(null)}
                          className="duolingo-button"
                        >
                          🔄 Try Again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WALLET TAB */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2 text-duolingo-green">👛 Wallet</h2>
                <p className="text-gray-600">Manage your Base wallet connection</p>
              </div>

              <div className="duolingo-card p-6 space-y-6">
                {isConnected && address ? (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-duolingo-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-duolingo-green mb-2">Wallet Connected!</h3>
                    </div>
                    <div className="bg-gradient-to-r from-duolingo-green/10 to-duolingo-blue/10 p-4 rounded-xl border-2 border-duolingo-green/20">
                      <p className="text-sm text-gray-600 mb-2">🔗 Connected Address</p>
                      <p className="text-lg font-mono font-bold text-duolingo-green">{truncateAddress(address)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-duolingo-blue/10 to-duolingo-purple/10 p-4 rounded-xl border-2 border-duolingo-blue/20">
                      <p className="text-sm text-gray-600 mb-2">📊 Status</p>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-duolingo-green rounded-full animate-pulse"></div>
                        <span className="font-semibold text-duolingo-green">Connected & Ready</span>
                      </div>
                    </div>
                    <button
                      onClick={() => disconnect()}
                      className="w-full px-6 py-3 bg-duolingo-red text-white font-semibold rounded-xl hover:bg-duolingo-red/90 transition-colors"
                    >
                      🔌 Disconnect Wallet
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-duolingo-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">👛</span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-gray-800 mb-2">Connect Your Wallet</h3>
                      <p className="text-gray-600 mb-6">
                        Wallet connection is automatic in Farcaster miniapp
                      </p>
                      <button
                        onClick={() => reconnect({ connectors: [config.connectors[0]] })}
                        className="duolingo-button"
                      >
                        🔄 Retry Connection
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => setShowDemo(true)}
                  className="text-sm text-duolingo-blue hover:text-duolingo-green underline font-medium transition-colors"
                >
                  🔍 View original demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
