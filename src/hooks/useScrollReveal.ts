import { useRef } from 'react'
import { useInView } from 'motion/react'

/**
 * Retourne { ref, isInView }.
 * Passe `ref` à l'élément que tu veux révéler au scroll.
 *
 * Usage :
 *   const { ref, isInView } = useScrollReveal()
 *   <motion.div ref={ref} animate={{ opacity: isInView ? 1 : 0 }} />
 */
export function useScrollReveal(options?: { once?: boolean; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    margin: (options?.margin ?? '0px 0px -80px 0px') as any,
  })
  return { ref, isInView }
}
