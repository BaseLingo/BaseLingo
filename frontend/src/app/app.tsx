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
  const { isFrameReady, setFrameReady, context } = useMiniKit();
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

  const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
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
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="p-4 bg-white border-b border-border">
          <h1 className="text-2xl font-bold text-center text-foreground">BaseLingo</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-border">
          <div className="flex">
            <button
              onClick={() => handleTabChange("earn")}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === "earn"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              � Earn
            </button>
            <button
              onClick={() => handleTabChange("learn")}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === "learn"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              � Learn
            </button>
            <button
              onClick={() => handleTabChange("wallet")}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === "wallet"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              👛 Wallet
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* EARN TAB */}
          {activeTab === "earn" && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-foreground">Earn & Withdraw</h2>

              {/* Progress Meter */}
              <div className="mb-6">
                <CompletionMeter completed={posted} />
              </div>

              {/* Deposit/Withdraw Section */}
              <div className="bg-white border border-border rounded-xl p-6 space-y-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current deposit</p>
                  <p className="text-2xl font-bold text-foreground">
                    {current ? `${current.amount} €` : "0.00 €"}
                  </p>
                </div>

                {current ? (
                  <div className="space-y-4">
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">Withdrawable (with 3% yield)</p>
                      <p className="text-2xl font-bold text-green-600">{withdrawable} €</p>
                    </div>
                    <button
                      className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                      onClick={handleWithdraw}
                    >
                      Withdraw {withdrawable} €
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Amount (€)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <button
                      className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={handleDeposit}
                      disabled={loading}
                    >
                      {loading ? "Signing..." : `Deposit ${amount} €`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEARN TAB */}
          {activeTab === "learn" && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
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
            </div>
          )}

          {/* WALLET TAB */}
          {activeTab === "wallet" && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-foreground">Wallet</h2>

              <div className="bg-white border border-border rounded-xl p-6 space-y-4">
                {isConnected && address ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Connected Address</p>
                      <p className="text-lg font-mono text-foreground">{truncateAddress(address)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-foreground">Connected</span>
                      </div>
                    </div>
                    <button
                      onClick={() => disconnect()}
                      className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Disconnect Wallet
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">👛</div>
                      <p className="text-muted-foreground mb-6">
                        Wallet connection is automatic in Farcaster miniapp
                      </p>
                      <button
                        onClick={() => reconnect({ connectors: [config.connectors[0]] })}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowDemo(true)}
                className="w-full mt-6 text-center text-sm text-gray-500 hover:text-gray-700 underline"
              >
                View original demo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
