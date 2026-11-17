"use client";

import { useEffect } from "react";

/**
 * Clignement d'œil du favicon.
 *
 * Les navigateurs n'animent pas un favicon SVG (Chrome fige la 1re image) :
 * on remplace donc le href du <link rel="icon"> image par image.
 * Images : /favicon.svg (ouvert) + /favicon-clignement/{mi,presque,ferme}.svg,
 * toutes en SVG adaptatif (noir en thème clair, crème en thème sombre).
 *
 * Limites : en arrière-plan, Chrome ralentit les minuteurs (≥ 1 s par image),
 * le clignement y est donc plus lent ; Safari ignore les changements de favicon.
 */

const FRAMES = {
  ouvert: "/favicon.svg",
  mi: "/favicon-clignement/mi.svg",
  presque: "/favicon-clignement/presque.svg",
  ferme: "/favicon-clignement/ferme.svg",
} as const;
type Frame = keyof typeof FRAMES;

/**
 * Clignement : [image, durée en ms], en partant de l'œil ouvert.
 * La paupière accélère en se fermant puis ralentit en s'ouvrant (même geste que le preloader) : la fermeture est l'ouverture jouée à l'envers.
 */
const SEQUENCE: [Frame, number][] = [
  ["mi", 100],
  ["presque", 60],
  ["ferme", 220], // pause sur l'œil complètement fermé
  ["presque", 60],
  ["mi", 100],
  ["ouvert", 0],
];
/** Écart entre deux clignements, tiré au hasard entre ces bornes, en ms. */
const DELAI_MIN_MS = 10_000;
const DELAI_MAX_MS = 25_000;

export default function FaviconBlink() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const link = document.querySelector<HTMLLinkElement>(
      'link[rel="icon"][type="image/svg+xml"]',
    );
    if (!link) return;

    let cancelled = false;
    let timer: number | undefined;

    // Images chargées une fois en data URL : le changement est instantané, sans requête.
    const urls: Record<Frame, string> = { ...FRAMES };
    const preload = Promise.all(
      (Object.keys(FRAMES) as Frame[]).map(async (frame) => {
        const res = await fetch(FRAMES[frame]);
        if (!res.ok) throw new Error(`favicon ${frame} : ${res.status}`);
        urls[frame] = "data:image/svg+xml," + encodeURIComponent(await res.text());
      }),
    );

    const schedule = () => {
      if (cancelled) return;
      timer = window.setTimeout(() => blink(0), DELAI_MIN_MS + Math.random() * (DELAI_MAX_MS - DELAI_MIN_MS));
    };

    const blink = (step: number) => {
      if (cancelled) return;
      if (step >= SEQUENCE.length) {
        schedule();
        return;
      }
      const [frame, ms] = SEQUENCE[step];
      link.href = urls[frame];
      timer = window.setTimeout(() => blink(step + 1), ms);
    };

    // Si une image manque, on laisse le favicon fixe.
    preload.then(schedule, () => {});

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      link.href = FRAMES.ouvert;
    };
  }, []);

  return null;
}
