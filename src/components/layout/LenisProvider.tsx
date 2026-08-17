'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'

// ─── Context ─────────────────────────────────────────────────────────────────
// Expose l'instance Lenis pour que les composants puissent s'y abonner
// ou appeler lenis.scrollTo() directement.

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Quand tu ajouteras GSAP ScrollTrigger, branche-le ici :
      // lenis.on('scroll', ScrollTrigger.update)
      // gsap.ticker.add((time) => { lenis.raf(time * 1000) })
      // gsap.ticker.lagSmoothing(0)
    })

    lenisRef.current = lenis

    // RAF loop — remplacer par gsap.ticker si/quand tu ajoutes GSAP
    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  )
}
