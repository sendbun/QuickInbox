import { Inbox } from "@/components/inbox"
import { getTranslations } from 'next-intl/server'
import {locales} from '@/i18n'

export default async function HomePage({params}:{params: Promise<{locale:string}>}) {
  const {locale} = await params
  const t = await getTranslations({locale})

  console.log(locales)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Inbox />
        
        {/* SEO Section - Similar to temp-mail.org */}
        <section className="mt-16">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                {t("seo.title")}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {t("seo.whatIs")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {t("seo.whatIsDescription1")}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t("seo.whatIsDescription2")}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {t("seo.howToUse")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{t("seo.step1")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("seo.step1Desc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{t("seo.step2")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("seo.step2Desc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{t("seo.step3")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("seo.step3Desc")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t("seo.benefits")}
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.privacy")}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("seo.privacyDesc")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.quick")}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("seo.quickDesc")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.safe")}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("seo.safeDesc")}
                    </p>
                  </div>
                </div>
              </div>
              
                             <div className="text-center">
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   {t("seo.perfectFor")}
                 </h3>
                 <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                   {t("seo.perfectForDesc")}
                 </p>
                 <div className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg font-medium">
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                   {t("cta.start")}
                 </div>
               </div>
             </div>
           </div>
         </section>

         {/* Additional SEO Content */}
         <section className="mt-12">
           <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
             <div className="max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                 {t("seo.guideTitle")}
               </h2>
               
               <div className="prose prose-gray dark:prose-invert max-w-none">
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   {t("seo.disposableTitle")}
                 </h3>
                 <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                   {t("seo.disposableDesc")}
                 </p>
                 
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   {t("seo.whyUse")}
                 </h3>
                 <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                   {t("seo.whyUseDesc")}
                 </p>
                 
                 <ul className="space-y-2 mb-6">
                   <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700 dark:text-gray-300">
                       {t("seo.useCase1")}
                     </span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700 dark:text-gray-300">
                       {t("seo.useCase2")}
                     </span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700 dark:text-gray-300">
                       {t("seo.useCase3")}
                     </span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700 dark:text-gray-300">
                       {t("seo.useCase4")}
                     </span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700 dark:text-gray-300">
                       {t("seo.useCase5")}
                     </span>
                   </li>
                 </ul>
                 
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   {t("seo.howWorks")}
                 </h3>
                 <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                   {t("seo.howWorksDesc")}
                 </p>
                 
                 <ol className="space-y-3 mb-6 list-decimal list-inside">
                   <li className="text-gray-700 dark:text-gray-300">
                     {t("seo.workStep1")}
                   </li>
                   <li className="text-gray-700 dark:text-gray-300">
                     {t("seo.workStep2")}
                   </li>
                   <li className="text-gray-700 dark:text-gray-300">
                     {t("seo.workStep3")}
                   </li>
                   <li className="text-gray-700 dark:text-gray-300">
                     {t("seo.workStep4")}
                   </li>
                 </ol>
                 
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   {t("seo.features")}
                 </h3>
                 <div className="grid md:grid-cols-2 gap-6 mb-6">
                   <div>
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.feature1")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.feature1Desc")}
                     </p>
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.feature2")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.feature2Desc")}
                     </p>
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.feature3")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.feature3Desc")}
                     </p>
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.feature4")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.feature4Desc")}
                     </p>
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.feature5")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.feature5Desc")}
                     </p>
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.feature6")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.feature6Desc")}
                     </p>
                   </div>
                 </div>
                 
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   {t("seo.commonUseCases")}
                 </h3>
                 <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                   {t("seo.commonUseCasesDesc")}
                 </p>
                 
                 <div className="grid md:grid-cols-2 gap-6 mb-6">
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.devUseCase")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.devUseCaseDesc")}
                     </p>
                   </div>
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.qaUseCase")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.qaUseCaseDesc")}
                     </p>
                   </div>
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.shoppingUseCase")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.shoppingUseCaseDesc")}
                     </p>
                   </div>
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t("seo.socialUseCase")}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {t("seo.socialUseCaseDesc")}
                     </p>
                   </div>
                 </div>
                 
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   {t("seo.security")}
                 </h3>
                 <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                   {t("seo.securityDesc")}
                 </p>
                 
                 <ul className="space-y-2 mb-6">
                   <li className="flex items-start">
                     <span className="text-orange-500 mr-2">⚠</span>
                     <span className="text-gray-700 dark:text-gray-300">
                       {t("seo.security1")}
                     </span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-orange-500 mr-2">⚠</span>
                     <span className="text-gray-700 dark:text-gray-300">
                       {t("seo.security2")}
                     </span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-orange-500 mr-2">⚠</span>
                     <span className="text-gray-700 dark:text-gray-300">
                       {t("seo.security3")}
                     </span>
                   </li>
                 </ul>
                 
                 <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                   <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                     {t("seo.startToday")}
                   </h4>
                   <p className="text-blue-700 dark:text-blue-300 mb-4">
                     {t("seo.startTodayDesc1")}
                   </p>
                   <p className="text-blue-700 dark:text-blue-300">
                     {t("seo.startTodayDesc2")}
                   </p>
                 </div>
               </div>
             </div>
           </div>
         </section>
      </main>
    </div>
  )
}