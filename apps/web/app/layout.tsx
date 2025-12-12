import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'AARON OS - Infinity Soul Protocol',
  description: 'The Sovereign Cloud - Control Plane Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  )
}
