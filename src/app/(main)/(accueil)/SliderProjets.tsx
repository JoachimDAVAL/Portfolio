'use client'

import { useRef, useState, type ReactNode } from 'react'

// Sous 1024 px : slider horizontal, un projet à la fois (scroll-snap) ; au-dessus : grille de 3
export default function SliderProjets({ total, children }: { total: number; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null)
  const [actif, setActif] = useState(0)

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setActif(max > 0 ? Math.round((el.scrollLeft / max) * (total - 1)) : 0)
  }

  return (
    <>
      <ul ref={ref} onScroll={onScroll} className="flex shrink-0 overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible gap-8 lg:gap-10">
        {children}
      </ul>
      <div aria-hidden="true" className="fade flex lg:hidden justify-center gap-3 -mt-4">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`size-1.5 rounded-full bg-current ${i === actif ? '' : 'opacity-30'}`} />
        ))}
      </div>
    </>
  )
}
