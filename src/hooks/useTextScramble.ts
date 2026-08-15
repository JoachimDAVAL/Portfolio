import { useState, useEffect, useRef } from 'react'

const CHARSET = '!<>-_\\/[]{}=+*^?#'

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

export function useTextScramble(text: string, revealed: boolean, delayFrames = 0, step = 1): string {
  const [display, setDisplay] = useState(revealed ? text : '')
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

    let frame = 0

    const tick = () => {
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
      frame++

      if (complete < queue.length) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [revealed, text, delayFrames, step])

  return display
}