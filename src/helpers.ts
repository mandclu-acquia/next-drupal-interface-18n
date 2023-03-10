export type I18nextTranslations = {
  [key: string]: { translation: { [key: string]: string } }
}

export const processTranslationNodes = (
  translationNodes // Map into i18n expected format
): I18nextTranslations => {
  const { i18nconfig } = require('./next-i18next.config');
  const translations = {}
  // Create our translations structure
  i18nconfig.locales.forEach(
    language => (translations[language] = { translation: {} })
  )

  translationNodes.forEach((node: any) => {
    translations[node.langcode].translation[node.source] = node.translation
  })
  return translations
}
