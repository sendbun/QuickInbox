"use client"

import { usePathname, useRouter } from "next/navigation"

const SUPPORTED_LOCALES = ["en", "de", "es"] as const

export function LocaleSwitch() {
  const router = useRouter()
  const pathname = usePathname()

  const currentLocale = pathname?.split("/")[1] || "en"

  function setLocale(locale: string) {
    if (!pathname) return
    const parts = pathname.split("/")
    parts[1] = locale
    router.push(parts.join("/"))
  }

  return (
    <select
      aria-label="Select language"
      className="bg-transparent text-sm border rounded px-2 py-1"
      value={currentLocale}
      onChange={(e) => setLocale(e.target.value)}
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  )
}


