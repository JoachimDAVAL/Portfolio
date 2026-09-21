'use client'

import { createContext, useContext, useRef, useCallback, useState, ReactNode } from 'react'

interface AudioContextValue {
  start: () => void
  toggleMute: () => void
  muted: boolean
}

const AudioCtx = createContext<AudioContextValue | null>(null)

const DEFAULT_VOLUME = 0.1

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)

  const start = useCallback(() => {
    if (audioRef.current) return
    const audio = new Audio()
    audio.loop = true
    audio.volume = DEFAULT_VOLUME
    const canOgg = audio.canPlayType('audio/ogg; codecs="vorbis"')
    audio.src = canOgg ? '/audio/ambient.ogg' : '/audio/ambient.mp3'
    audio.play().catch(() => {})
    audioRef.current = audio
  }, [])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.muted = !audioRef.current.muted
    setMuted(prev => !prev)
  }, [])

  return (
    <AudioCtx.Provider value={{ start, toggleMute, muted }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}