'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-sm font-medium tracking-widest uppercase opacity-80 hover:opacity-100 transition-opacity">
        {/* Remplace par le nom du compositeur */}
        Portfolio
      </Link>

      <nav className="flex items-center gap-8">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              {link.label}
              {isActive && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-px bg-current"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
