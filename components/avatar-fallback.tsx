"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface AvatarFallbackProps {
  userId: string
  fullName: string
  avatarUrl: string | null
  className?: string
}

export function AvatarFallback({ userId, fullName, avatarUrl, className = "h-10 w-10" }: AvatarFallbackProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const supabase = createClient()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const loadAvatar = async () => {
    if (!avatarUrl || loading || error) return

    setLoading(true)
    setError(false)

    try {
      // Try to get signed URL if direct access fails
      const { data, error: signError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarUrl.split('/').pop() || '', 3600) // 1 hour expiry

      if (signError) {
        console.log('Signed URL failed, trying direct URL:', signError)
        // Fallback to direct URL
        setImageUrl(avatarUrl)
      } else {
        setImageUrl(data.signedUrl)
      }
    } catch (err) {
      console.log('Avatar loading failed, using direct URL:', err)
      setImageUrl(avatarUrl)
    } finally {
      setLoading(false)
    }
  }

  // Load avatar when component mounts or URL changes
  useEffect(() => {
    loadAvatar()
  }, [avatarUrl])

  if (error || !imageUrl) {
    return (
      <div className={`${className} rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm`}>
        {getInitials(fullName)}
      </div>
    )
  }

  return (
    <div className={`${className} rounded-full overflow-hidden relative`}>
      {loading && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={fullName}
        className={`h-full w-full object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={() => {
          console.log('Image failed to load, showing initials')
          setError(true)
        }}
        onLoad={() => {
          console.log('Avatar loaded successfully')
          setLoading(false)
        }}
      />
    </div>
  )
}
