// @todo replace with a Next.js equivalent.
import { useLocalization } from "gatsby-theme-i18n"

export type I18nextTranslations = {
  [key: string]: { translation: { [key: string]: string } }
}

export const processTranslationNodes = (
  translationNodes // Map into i18n expected format
): I18nextTranslations => {
  const { config } = useLocalization()
  const translations = {}
  // Create our translations structure
  config.forEach(
    language => (translations[language.code] = { translation: {} })
  )

  translationNodes.forEach((node: any) => {
    translations[node.langcode].translation[node.source] = node.translation
  })
  return translations
}
