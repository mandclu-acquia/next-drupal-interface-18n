const fallbackLng = `en`
const defaultNamespace = `translation`
const defaultPath = `decoupled-interface-translations`
const defaultAddPath = `${defaultPath}/add`

function withDefaults(pluginOptions) {
  return {
    ...pluginOptions,
    i18nextOptions: {
      defaultNS: defaultNamespace,
      ns: [defaultNamespace],
      fallbackLng,
      interpolation: {
        escapeValue: false,
        ...pluginOptions.i18nextOptions.escapeValue,
      },
      initImmediate: false,
      ...pluginOptions.i18nextOptions,
    },
    i18nextScannerOptions: {
      input: [
        "./src/pages/*.{js,jsx,ts,tsx}",
        "./src/components/*.{js,jsx,ts,tsx}",
        "./src/templates/*.{js,jsx,ts,tsx}",
      ],
      output: "./i18n/locales",
      options: {
        debug: false,
        func: {
          list: ["t"],
          extensions: [".js", ".jsx"],
        },
        trans: false,
        ns: ["translation"],
        defaultLng: "en",
        defaultNs: "translation",
        resource: {
          savePath: "dev.json",
          jsonIndent: 2,
          lineEnding: "\n",
        },
        nsSeparator: false, // namespace separator
        keySeparator: false, // key separator
      },
      ...pluginOptions.i18nextScannerOptions
    },
  }
}

module.exports = {
  defaultNamespace,
  defaultPath,
  defaultAddPath,
  withDefaults,
}
