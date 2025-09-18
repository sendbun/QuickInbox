/**
 * Centralized i18n configuration
 * 
 * To add a new language:
 * 1. Add the locale code to supportedLocales array (e.g., 'fr', 'de')
 * 2. Add the language name to languageNames object
 * 3. Add the flag emoji to languageFlags object (optional)
 * 4. Create the message file: messages/{locale}.json
 * 5. Import and add to messagesMap object
 * 
 * That's it! No need to modify other files.
 */

export const supportedLocales = ['en', 'es', 'de'] as const
export type SupportedLocale = typeof supportedLocales[number]

export const defaultLocale: SupportedLocale = 'en'

// Language display names (for UI)
export const languageNames: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch'
}

// Language flags/emojis (optional, for UI)
export const languageFlags: Record<SupportedLocale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  de: '🇩🇪'
}

// Messages map - statically imported
export const messagesMap = {
  en: require('../messages/en.json'),
  es: require('../messages/es.json'),
  de: require('../messages/de.json')
} as const

// Helper functions
export function isValidLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale)
}

export function getLocaleMessages(locale: string) {
  const selectedLocale = isValidLocale(locale) ? locale : defaultLocale
  return messagesMap[selectedLocale] ?? messagesMap[defaultLocale]
}

// Export for next-intl
export const locales = supportedLocales
export type AppLocale = SupportedLocale