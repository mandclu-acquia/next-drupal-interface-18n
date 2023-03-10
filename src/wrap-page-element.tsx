import * as React from "react"
import i18n from "i18next"
import { I18nProvider, TranslationsProvider } from "./context"
import { withDefaults } from "./utils/default-options"

export const wrapPageElement = ({ element, props }, pluginOptions) => {
  // Merge default i18next options with pluginOptions
  const { i18nextOptions } = withDefaults(pluginOptions)
  // Change i18next current language based on Gatsby pageContext language.
  const i18nConfig = {
    lng: props.pageContext.locale,
    ...i18nextOptions,
  }

  i18n.init(i18nConfig)

  return (
    <TranslationsProvider>
      <I18nProvider i18n={i18n}>{element}</I18nProvider>
    </TranslationsProvider>
  )
}
