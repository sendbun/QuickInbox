import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// Moved providers and layout content into locale layout
import GoogleAnalytics from "@/plugin/analytics/google-analytics"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TempMail - Temporary Email Service",
  description: "Generate temporary email addresses for privacy and security",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string} />
        )}
        {children}
      </body>
    </html>
  )
}