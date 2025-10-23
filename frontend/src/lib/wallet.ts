// lib/wallet.ts
// This file provides a simple wrapper for wallet operations
// For actual signing, we'll use wagmi hooks in components

export async function signMessage(): Promise<string> {
  // This is a placeholder - actual signing should be done using wagmi hooks
  // in the component context. This function is here for backwards compatibility
  // but should be refactored to use hooks.
  throw new Error('Please use useSignMessage hook from wagmi instead of this function')
}
