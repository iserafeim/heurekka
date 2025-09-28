import React from 'react'
import { cn } from '@/lib/utils'
import { Building2, MapPin } from 'lucide-react'

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
    <div className={cn("w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center", className)}>
      <span className="text-white font-bold text-lg">H</span>
    </div>
  )
}