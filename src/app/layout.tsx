import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { LenisProvider } from '@/components/layout/LenisProvider'
import { GlobalPlayer } from '@/components/audio/GlobalPlayer'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Portfolio — Sound Design & Game Music',
  description: 'Compositeur et sound designer pour jeux vidéo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <LenisProvider>
          {children}
          {/* Le player flotte au-dessus de tout et survit aux transitions */}
          <GlobalPlayer />
        </LenisProvider>
      </body>
    </html>
  )
}
