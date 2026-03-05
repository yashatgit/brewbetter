import type { Metadata } from 'next'
import '@/index.css'
import { Providers } from './providers'
import { Shell } from './shell'

export const metadata: Metadata = {
  title: 'Brew Better',
  description: 'A local-first specialty coffee journal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  )
}
