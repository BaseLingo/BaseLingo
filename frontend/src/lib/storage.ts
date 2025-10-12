// lib/storage.ts
const KEY = "lingua-vault:deposit"

export type DepositState = {
  amount: number   // euros
  depositedAt: string // ISO date
}

export function saveDeposit(state: DepositState | null) {
  if (!state) {
    localStorage.removeItem(KEY)
  } else {
    localStorage.setItem(KEY, JSON.stringify(state))
  }
}

export function loadDeposit(): DepositState | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// compute mocked yield: static +3% on deposit for demonstration
export function computeWithdrawable(deposit: DepositState | null) {
  if (!deposit) return 0
  const principal = deposit.amount
  const yieldAmount = +(principal * 0.03).toFixed(2)
  return +(principal + yieldAmount).toFixed(2)
}
