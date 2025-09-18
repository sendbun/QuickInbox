import { defaultLocale, isValidLocale, type SupportedLocale } from './i18n-config'

export type ContentSection = {
  heading: string
  body: string
}

export type PageContent = {
  title: string
  intro?: string
  sections?: ContentSection[]
}

export async function loadPageContent(page: 'about' | 'privacy' | 'terms' | 'contact', localeInput: string): Promise<PageContent> {
  const locale: SupportedLocale = isValidLocale(localeInput) ? (localeInput as SupportedLocale) : defaultLocale
  try {
    const mod = await import(`../content/${page}/${locale}.json`)
    return mod.default as PageContent
  } catch {
    const fallback = await import(`../content/${page}/${defaultLocale}.json`)
    return fallback.default as PageContent
  }
}


