import { useState, useEffect, useRef } from 'react'

const CHARSET = '!<>-_\\/[]{}=+*^?#'

// Le brouillage compte en « images » de 60 Hz, mesurées à l'horloge (et non une par rafraîchissement d'écran) :
// même vitesse sur un écran à 60, 120 ou 144 Hz. Aussi utilisé par le Preloader.
export const FRAME_MS = 1000 / 60

export function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

export function useTextScramble(text: string, revealed: boolean, delayFrames = 0, step = 1): string {
  // Toujours vide au montage : en revenant sur une page (revealed déjà vrai), le texte se forme comme au premier
  // chargement. Partir du texte complet le faisait se re-brouiller par vagues, lettre après lettre (long, lignes qui bougent).
  const [display, setDisplay] = useState('')
  const rafRef = useRef<number>(0)
  const displayRef = useRef(display)

  displayRef.current = display

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)

    const target = revealed ? text : ''
    const from = displayRef.current
    const length = Math.max(from.length, target.length)

    type QueueItem = { from: string; to: string; start: number; end: number; char?: string }

    const queue: QueueItem[] = Array.from({ length }, (_, i) => ({
      from: from[i] ?? '',
      to: target[i] ?? '',
      start: delayFrames + Math.floor(i / step),
      end: delayFrames + Math.floor(i / step) + Math.floor(Math.random() * 8) + 6,
    }))

    let t0 = -1
    let frame = -1

    const tick = (now: number) => {
      if (t0 < 0) t0 = now
      const f = Math.floor((now - t0) / FRAME_MS)
      // Écran plus rapide que 60 Hz : rien à changer tant qu'on est dans la même image
      if (f === frame) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      frame = f

      let output = ''
      let complete = 0

      for (const item of queue) {
        if (frame >= item.end) {
          complete++
          output += item.to
        } else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = randomChar()
          }
          output += item.char
        } else {
          output += item.from
        }
      }

      setDisplay(output)

      if (complete < queue.length) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [revealed, text, delayFrames, step])

  return display
}