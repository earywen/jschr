"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { BorderBeam } from "./border-beam"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    showBorderBeam?: boolean
    beamColorFrom?: string
    beamColorTo?: string
    innerClassName?: string
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, showBorderBeam = false, beamColorFrom, beamColorTo, innerClassName, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative rounded-2xl border border-white/10 bg-card backdrop-blur-xl shadow-2xl transition-all duration-300",
                    className
                )}
                {...props}
            >
                <div className={cn("relative z-10 h-full w-full p-6", innerClassName)}>
                    {children}
                </div>

                {showBorderBeam && (
                    <BorderBeam
                        size={250}
                        duration={12}
                        colorFrom={beamColorFrom}
                        colorTo={beamColorTo}
                    />
                )}
            </div>
        )
    }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
