import { Navbar } from '@/components/layout/Navbar'
import { PageTransition } from '@/components/transitions/PageTransition'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <PageTransition>
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </PageTransition>
    </>
  )
}
