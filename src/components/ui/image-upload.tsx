'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, CheckCircle2, Loader2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleUpload = async (file: File) => {
        try {
            setIsUploading(true)
            setError(null)
            setUploadProgress(0)

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Le fichier doit être une image.')
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('L\'image est trop lourde (max 5Mo).')
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
            const filePath = `screenshots/${fileName}`

            const { data, error: uploadError } = await supabase.storage
                .from('candidates-screenshots')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('candidates-screenshots')
                .getPublicUrl(filePath)

            onChange(publicUrl)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Une erreur est survenue lors de l\'envoi.')
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }

    const removeImage = () => {
        onChange('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className={cn('space-y-4', className)}>
            <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                    'relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300',
                    value
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10',
                    isUploading && 'opacity-50 cursor-not-allowed',
                    error && 'border-red-500/50 bg-red-500/5'
                )}
            >
                {/* Input caché */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    {value ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden group/image">
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeImage()
                                    }}
                                    className="gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Supprimer
                                </Button>
                            </div>
                            <div className="absolute top-2 right-2 bg-emerald-500 text-black px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                <CheckCircle2 className="h-3 w-3" />
                                Transmis
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={cn(
                                'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
                                error && 'text-red-400 border-red-500/20 bg-red-500/10'
                            )}>
                                {isUploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : error ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Upload className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                    {isUploading ? 'Transfert en cours...' : 'Cliquez pour envoyer votre UI'}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    Format JPG, PNG (Max 5Mo)
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs font-bold text-red-400 flex items-center gap-1.5 px-1">
                    <X className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    )
}
