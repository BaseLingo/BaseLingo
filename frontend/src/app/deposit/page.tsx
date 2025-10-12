// app/deposit/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react"
import { saveDeposit, loadDeposit, computeWithdrawable } from "~/lib/storage"
import { sdk } from "@farcaster/miniapp-sdk"
import { useRouter } from "next/navigation"
import { useSignMessage, useAccount, useReconnect } from "wagmi"
import { config } from "~/components/providers/WagmiProvider"

export default function DepositPage() {
  const router = useRouter()
  const [current, setCurrent] = useState<ReturnType<typeof loadDeposit>>(null)
  const [amount, setAmount] = useState<number>(10)
  const [loading, setLoading] = useState(false)
  const { signMessageAsync } = useSignMessage()
  const { isConnected } = useAccount()
  const { reconnect } = useReconnect()

  useEffect(() => {
    // Load deposit only on client side
    setCurrent(loadDeposit())

    // Try to reconnect the Farcaster miniapp connector on mount
    if (!isConnected) {
      reconnect({ connectors: [config.connectors[0]] })
    }
  }, [isConnected, reconnect])

  const handleDeposit = useCallback(async () => {
    setLoading(true)
    const msg = `I deposit ${amount} euros`
    try {
      const sig = await signMessageAsync({ message: msg })
      console.log("Signed deposit:", sig)
      const depositState = { amount, depositedAt: new Date().toISOString() }
      saveDeposit(depositState)
      setCurrent(depositState)
      // success haptics when deposit done
      if (sdk.haptics) await sdk.haptics.notificationOccurred("success")
      // navigate to lesson tab
      router.push("/lesson")
    } catch (err) {
      console.error(err)
      alert("Sign failed - please ensure you're in the Farcaster miniapp")
    } finally {
      setLoading(false)
    }
  }, [amount, signMessageAsync, router])

  const handleWithdraw = useCallback(async () => {
    if (!current) return
    const withdrawable = computeWithdrawable(current)
    const msg = `Withdrawing ${withdrawable} euros`
    try {
      const sig = await signMessageAsync({ message: msg })
      console.log("Signed withdraw:", sig)
      // clear state
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

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Deposit</h1>

        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
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

        <div className="mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
