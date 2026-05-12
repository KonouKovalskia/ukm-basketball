import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UKM Basketball',
  description: 'Portal resmi UKM Basketball — Satu Tim, Satu Tujuan.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${geist.className} bg-gray-950 antialiased`}>
        {children}
      </body>
    </html>
  )
}