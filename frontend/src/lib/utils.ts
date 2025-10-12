import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const METADATA = {
  name: "BaseLingo",
  description: "Learn languages and earn yield while you study. Deposit USDC, complete daily lessons, and withdraw with returns.",
  bannerImageUrl: 'https://i.imgur.com/2bsV8mV.png',
  iconImageUrl: 'https://i.imgur.com/brcnijg.png',
  homeUrl: process.env.NEXT_PUBLIC_URL ?? "https://fulldemo-minikit.vercel.app",
  splashBackgroundColor: "#0066FF"
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
