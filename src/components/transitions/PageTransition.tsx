'use client'

import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'

// ─── Overlay SVG aquatique ────────────────────────────────────────────────────
// On anime un overlay plein écran avec un filtre de distorsion "eau"
// pendant le changement de page. Aucun WebGL nécessaire.

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      {/* Filtre SVG déposé hors du DOM visible — référencé par id */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden>
        <defs>
          <filter id="water-distort">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="60"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, filter: 'url(#water-distort) blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'url(#water-distort) blur(4px)' }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1], // custom cubic — easing "vague qui se déroule"
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
