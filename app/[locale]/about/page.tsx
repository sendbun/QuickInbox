import { getTranslations } from 'next-intl/server'

export default async function AboutPage() {
  const t = await getTranslations()
  const sections = t.raw('pages.about.sections') as Array<{heading: string; body: string}>
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">{t('pages.about.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('pages.about.intro')}</p>
      <div className="prose dark:prose-invert">
        {sections?.map((s, i) => (
          <section key={i}>
            <h2>{s.heading}</h2>
            <p>{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}


