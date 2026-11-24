// Texte d'une diapositive, présent en entier dans le HTML du serveur.
// data-place = la vraie copie, qui réserve la place (transparente tant que le texte n'est pas formé, voir accueil.css)
// data-calque = le texte animé, rempli par moteur.ts
type Props = {
  children: string
  delay?: number // en images de 60 Hz
  step?: number // caractères par image (3 pour un paragraphe)
  lu?: string // version lue par les lecteurs d'écran, si elle diffère de l'affichage (police de titre sans accents)
}

export default function Texte({ children, delay = 0, step = 1, lu }: Props) {
  return (
    <span data-texte="" data-delay={delay} data-step={step} className="relative block">
      {lu ? <span className="sr-only">{lu}</span> : null}
      <span data-place="" aria-hidden={lu ? true : undefined}>{children}</span>
      <span data-calque="" aria-hidden="true" className="absolute inset-0" />
    </span>
  )
}
