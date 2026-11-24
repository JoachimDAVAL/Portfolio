import Link from 'next/link'
import Texte from './Texte'

const crochet = 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150'

type Props = { href: string; children: string; delay?: number; className?: string }

// Lien entre crochets (au survol et au clavier)
export default function Lien({ href, children, delay, className = '' }: Props) {
  return (
    <Link href={href} className={`group flex gap-2 tracking-widest uppercase ${className}`}>
      <span aria-hidden="true" className={crochet}>[</span>
      <Texte delay={delay}>{children}</Texte>
      <span aria-hidden="true" className={crochet}>]</span>
    </Link>
  )
}
