'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyableTextProps {
    value: string
    label?: string
    className?: string
}

export function CopyableText({ value, label, className }: CopyableTextProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    if (!value) return <span className="text-[#94A3B8]">N/A</span>

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "group flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#4361EE] text-right",
                className
            )}
            title={label ? `Copier ${label}` : 'Copier'}
        >
            <span className="text-white group-hover:text-[#4361EE] transition-colors">
                {value}
            </span>
            {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
            ) : (
                <Copy className="h-3 w-3 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-all" />
            )}
        </button>
    )
}
