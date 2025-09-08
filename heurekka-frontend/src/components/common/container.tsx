import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

const containerSizes = {
  sm: "max-w-screen-sm", // 640px
  md: "max-w-screen-md", // 768px
  lg: "max-w-screen-lg", // 1024px
  xl: "max-w-screen-xl", // 1280px
  "2xl": "max-w-screen-2xl", // 1536px
  full: "max-w-full"
}

export function Container({ 
  children, 
  className, 
  size = "xl" 
}: ContainerProps) {
  return (
    <div className={cn(
      "mx-auto w-full px-4 sm:px-6 lg:px-8",
      containerSizes[size],
      className
    )}>
      {children}
    </div>
  )
}