import type { Metadata } from 'next'
import './globals.css'
import { Theme } from '@radix-ui/themes'

export const metadata: Metadata = {
  title: 'Demo: Interaktives Video für den Serlo Editor',
  description: 'Demonstration eines interaktiven Videos für den Serlo Editor',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body>
        <Theme>{children}</Theme>
      </body>
    </html>
  )
}
