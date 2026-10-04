'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const enterDisplay = useTextScramble('ENTER', mounted)
  const router = useRouter()

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <video className="fixed inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
        <source src="https://res.cloudinary.com/ln8fnpns/video/upload/v1789733283/enter.webm" type="video/webm" />
        <source src="https://res.cloudinary.com/ln8fnpns/video/upload/v1789733283/enter.mp4" type="video/mp4" />
      </video>
      <button
        onClick={() => router.push('/about')}
        className="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl cursor-pointer bg-transparent border-none text-inherit"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">[</span>
        {enterDisplay}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">]</span>
      </button>
    </main>
  )
}