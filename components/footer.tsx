"use client"

import { useTranslations } from 'next-intl'
import { Twitter, Github, Linkedin, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { locales, languageNames, languageFlags } from '@/lib/i18n-config'
import Image from 'next/image'

export function Footer() {
  const t = useTranslations()
  const router = useRouter() 
  const pathname = usePathname()
  const year = new Date().getFullYear()

  const handleLanguageChange = (locale: string) => {
    // Replace the current locale in the pathname
    const segments = pathname.split('/')
    segments[1] = locale // Replace the locale segment
    const newPath = segments.join('/')
    router.push(newPath)
  }

  const getLocale = () => {
    const segments = pathname.split('/')
    return segments[1] || 'en'
  }

  const hrefFor = (slug: string) => `/${getLocale()}/${slug}`

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* TempMail Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image src="/logo.png" alt="Logo" width={118} height={68} priority />
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t('footer.company.title')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={hrefFor('about')} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  {t('footer.company.about')}
                </Link>
              </li>
              <li>
                <Link href={hrefFor('privacy')} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  {t('footer.company.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href={hrefFor('terms')} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  {t('footer.company.termsOfService')}
                </Link>
              </li>
              <li>
                <Link href={hrefFor('contact')} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  {t('footer.company.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 mr-2 text-gray-900" />
            <h4 className="font-semibold text-gray-900">{t('footer.language.title')}</h4>
          </div>
          <Select value={getLocale()} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-48 border-gray-300">
              <SelectValue placeholder={t('footer.language.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {locales.map((locale) => (
                <SelectItem key={locale} value={locale}>
                  <div className="flex items-center">
                    <span className="mr-2">{languageFlags[locale]}</span>
                    <span>{languageNames[locale]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-gray-600 text-sm">
            {t('footer.copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  )
}
