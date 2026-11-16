import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Konecta — Neo-Brutalism | Cabo Verde',
  description: 'Konecta.cv — Neo-Brutalism Design System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-sans antialiased selection:bg-[#FFD027] selection:text-black">
        {children}
      </body>
    </html>
  )
}
