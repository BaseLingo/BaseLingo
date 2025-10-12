// components/ConnectButton.tsx
"use client";

import React from "react"
import { sdk } from "@farcaster/miniapp-sdk"

export default function ConnectButton({ onConnect }: { onConnect?: () => void }) {
  async function handleConnect() {
    try {
      // the demo template may already call sdk.actions.ready() elsewhere.
      // quick auth is automatic in many mini app runtimes; we call ready to hide splash once UI loads
      await sdk.actions.ready()
      // if any extra logic is needed to prompt wallet, call:
      // await sdk.wallet.getEthereumProvider()
      // no-op: provider will show when signing.
      console.log("App ready!")
      if (onConnect) onConnect()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <button
      className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      onClick={handleConnect}
    >
      Connect & Start
    </button>
  )
}
