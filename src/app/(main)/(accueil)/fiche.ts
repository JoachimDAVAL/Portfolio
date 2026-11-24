'use client'

import { createContext, useContext } from 'react'
import type { Projet } from '@/lib/projets'

// Ouvre la fiche d'un projet par-dessus les diapositives (fourni par Diaporama)
export const FicheContext = createContext<(projet: Projet) => void>(() => {})
export const useOuvrirFiche = () => useContext(FicheContext)
