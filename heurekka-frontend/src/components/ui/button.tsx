import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary button - Main CTAs (Design System: #2563EB → #1D4ED8 → #1E40AF)
        primary:
          "bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] shadow-sm hover:shadow-[0_4px_6px_rgba(37,99,235,0.2)] hover:-translate-y-px active:translate-y-0 active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:border-2 focus-visible:border-[#1D4ED8] focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]",
        // WhatsApp button - Communication actions
        whatsapp:
          "bg-[#25D366] text-white hover:bg-[#128C7E] active:bg-[#075E54] shadow-[0_2px_8px_rgba(37,211,102,0.3)] hover:shadow-[0_4px_12px_rgba(37,211,102,0.4)] rounded-full",
        // Secondary button - Alternative actions
        secondary:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        // Ghost button - Subtle actions
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Destructive actions
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        // Outline button
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        // Link style
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-12 rounded-lg px-8 text-base md:h-14 md:px-10 md:text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }