import * as React from "react"
import { createContext, useContext } from "react"
import { useDrupalTranslations } from "./hooks/use-drupal-translations"
import { I18nextTranslations, processTranslationNodes } from "./helpers"
import { defaultNamespace } from "./utils/default-options"
import { I18nextProvider } from "react-i18next"
// @todo find a Next equivalent for theme-i18n
import { useLocalization } from "gatsby-theme-i18n"

export const TranslationsContext = createContext({})

export const TranslationsProvider: React.FC = ({ children }) => {
  const translationNodes = useDrupalTranslations()

  const translations: I18nextTranslations = processTranslationNodes(
    translationNodes
  )

  return (
    <TranslationsContext.Provider value={translations}>
      {children}
    </TranslationsContext.Provider>
  )
}

export const I18nProvider: React.FC<{ i18n: any }> = ({ children, i18n }) => {
  const translations = useContext(TranslationsContext)
  const { config } = useLocalization()

  config.forEach(language => {
    i18n.addResources(
      language.code,
      defaultNamespace,
      translations[language.code][defaultNamespace]
    )
  })

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
