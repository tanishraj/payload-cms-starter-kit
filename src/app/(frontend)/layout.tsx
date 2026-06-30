import type { Metadata } from 'next'
import { JetBrains_Mono, Manrope } from 'next/font/google'
import React from 'react'

import '@/styles/globals.css'

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  description: 'Payload CMS starter kit with Tailwind and a shadcn-ready block renderer.',
  title: 'Payload CMS Starter Kit',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        <main>{children}</main>
      </body>
    </html>
  )
}
