'use client'

import { createContext, useContext, useRef, useCallback, useState, ReactNode } from 'react'

interface AudioContextValue {
  toggle: () => void
  active: boolean
}

const AudioCtx = createContext<AudioContextValue | null>(null)

const DEFAULT_VOLUME = 0.1

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [active, setActive] = useState(false)

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.loop = true
      audio.volume = DEFAULT_VOLUME
      const canOgg = audio.canPlayType('audio/ogg; codecs="vorbis"')
      audio.src = canOgg ? '/audio/ambient.ogg' : '/audio/ambient.mp3'
      audio.play().catch(() => {})
      audioRef.current = audio
      setActive(true)
    } else {
      audioRef.current.muted = !audioRef.current.muted
      setActive(prev => !prev)
    }
  }, [])

  return (
    <AudioCtx.Provider value={{ toggle, active }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}