'use client'

import { useState, ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    fallback?: React.ReactNode
    hideOnEmpty?: boolean
}

export function SafeImage({
    src,
    alt,
    className,
    fallback,
    hideOnEmpty = true,
    ...props
}: SafeImageProps) {
    const [error, setError] = useState(false)

    if (error || !src) {
        if (hideOnEmpty) return null
        return <>{fallback}</>
    }

    return (
        <img
            src={src}
            alt={alt}
            className={cn(className)}
            onError={() => setError(true)}
            {...props}
        />
    )
}
