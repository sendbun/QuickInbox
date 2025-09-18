import type { ReactNode } from "react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "@/components/theme-provider"
import { EmailHeader } from "@/components/email-header"
import { Footer } from "@/components/footer"
import { getLocaleMessages, isValidLocale, defaultLocale } from "../../lib/i18n-config"
import "../globals.css"

async function getMessages(locale: string) {
  try {
    return getLocaleMessages(locale)
  } catch (error) {
    return getLocaleMessages(defaultLocale)
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const safeLocale = isValidLocale(locale) ? locale : defaultLocale
  const messages = await getMessages(safeLocale)

  return (
    <html lang={safeLocale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={safeLocale} messages={messages}>
            <div className="min-h-screen flex flex-col">
              <EmailHeader />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



