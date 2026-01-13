import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApprovalColor(percentage: number | undefined): string {
  if (percentage === undefined) return '#94A3B8'
  // Map 0-100 to HSL Hue 0 (Red) to 142 (Emerald Green)
  const hue = (percentage / 100) * 142
  return `hsl(${hue}, 80%, 50%)`
}
