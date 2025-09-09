import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

interface LogoIconProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LogoIcon />
      <span className="text-xl font-bold text-foreground">Heurekka</span>
    </div>
  )
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      {/* Clean house icon */}
      <path
        d="M16 3L6 11v17a1 1 0 001 1h5v-7a2 2 0 012-2h4a2 2 0 012 2v7h5a1 1 0 001-1V11L16 3z"
        fill="currentColor"
      />
      <path
        d="M16 3L6 11h20L16 3z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Simple door */}
      <rect
        x="14"
        y="22"
        width="4"
        height="6"
        fill="white"
        opacity="0.8"
      />
      {/* Window */}
      <rect
        x="10"
        y="16"
        width="3"
        height="3"
        fill="white"
        opacity="0.8"
      />
      <rect
        x="19"
        y="16"
        width="3"
        height="3"
        fill="white"
        opacity="0.8"
      />
    </svg>
  )
}