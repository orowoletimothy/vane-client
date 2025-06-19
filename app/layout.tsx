import type React from "react"
import type { Metadata } from "next"
import { inter } from "@/lib/fonts"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vane - Habit Tracking & Formation",
  description: "Build better habits with Vane - your personal habit tracking companion",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
