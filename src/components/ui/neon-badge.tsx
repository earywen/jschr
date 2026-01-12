import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const neonBadgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]",
                secondary:
                    "border-transparent bg-secondary/30 text-secondary-foreground backdrop-blur-md",
                destructive:
                    "border-transparent bg-destructive/20 text-destructive shadow-[0_0_10px_rgba(var(--destructive),0.4)]",
                outline: "text-foreground border border-white/10 backdrop-blur-md",
                success:
                    "border-transparent bg-[var(--neon-green)]/20 text-[var(--neon-green)] shadow-[0_0_12px_rgba(var(--neon-green),0.3)]",
                pending:
                    "border-transparent bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] shadow-[0_0_12px_rgba(var(--neon-cyan),0.3)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface NeonBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof neonBadgeVariants> { }

function NeonBadge({ className, variant, ...props }: NeonBadgeProps) {
    return (
        <div className={cn(neonBadgeVariants({ variant }), className)} {...props} />
    )
}

export { NeonBadge, neonBadgeVariants }
