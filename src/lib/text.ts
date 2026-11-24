// bd-palaktbau (police de titre) n'a pas de lettres accentuées : « Méthode » s'affiche « Methode ».
// Le texte accentué reste celui qui est lu (aria-label).
export const sansAccents = (texte: string) => texte.normalize('NFD').replace(/\p{Diacritic}/gu, '')
