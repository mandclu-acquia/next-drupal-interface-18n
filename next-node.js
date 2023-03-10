const axios = require("axios")
const fs = require("fs")
const chalk = require("chalk")
const scanner = require("i18next-scanner")
const vfs = require("vinyl-fs")
const sort = require("gulp-sort")
const typescriptTransform = require("./src/utils/typescript-transform")

const {
  withDefaults,
  defaultPath,
  defaultAddPath,
} = require("./src/utils/default-options")

exports.sourceNodes = async (
  { reporter, actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createNode } = actions
  reporter.info(
    `[nextjs-plugin-drupal-i18next]: fetching Drupal interface translations from ${pluginOptions.baseUrl}${defaultPath}`
  )
  // Retrieve Drupal interface translations.
  const response = await axios.get(`${pluginOptions.baseUrl}${defaultPath}`, {
    auth: pluginOptions.basicAuth,
  })

  if (response.data) {
    await Promise.all(
      // Expects top level to be langcode, then key value pairs of translations
      Object.keys(response.data).map(async langcode =>
        Object.keys(response.data[langcode]).forEach(source => {
          // Process the translation, creating a Gatsby node object.
          let translationNode = processTranslation(
            langcode,
            source,
            response.data[langcode][source]
          )
          // Add Gatsby internal requirements
          translationNode.id = createNodeId(
            `drupal-translation-${langcode}${source}`
          )
          translationNode.internal.contentDigest = createContentDigest(
            translationNode.internal.content
          )
          // Create Gatsby node for the given translations
          createNode(translationNode)
        })
      )
    )
  }

  return
}

exports.onPostBuild = ({ reporter }, pluginOptions, callback) => {
  // Merge default i18next options with pluginOptions
  const { i18nextScannerOptions } = withDefaults(pluginOptions)
  reporter.info(
    `[nextjs-plugin-drupal-i18next]: scanning files for translatable strings.`
  )
  vfs
    .src(i18nextScannerOptions.input)
    .pipe(sort()) // Sort files in stream by path
    .pipe(scanner(i18nextScannerOptions.options, typescriptTransform()))
    .pipe(vfs.dest(i18nextScannerOptions.output))
    .on("finish", async function () {
      try {
        const devTranslations = JSON.parse(
          fs.readFileSync(
            i18nextScannerOptions.output +
              "/" +
              i18nextScannerOptions.options.resource.savePath
          )
        )
        // We've got our translatable strings, push to Drupal
        let devTranslationKeys = Object.keys(devTranslations)

        reporter.info(
          `[gatsby-plugin-drupal-i18next]: pushing new Drupal translations to ${pluginOptions.baseUrl}${defaultAddPath}`
        )
        const response = await axios.post(
          `${pluginOptions.baseUrl}${defaultAddPath}`,
          devTranslationKeys,
          {
            auth: pluginOptions.basicAuth,
          }
        )
        reporter.info(
          `[gatsby-plugin-drupal-i18next]: ${response.data.message}`
        )
        callback()
      } catch (error) {
        console.log(
          `${chalk.bold.bgRed(
            "No dev translations found in file his is a requirement to generate translation strings."
          )}`
        )
        callback()
        return
      }
    })
}

// This lets Gatsby know what to expect for Gatsby nodes of type DrupalTranslation
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type DrupalTranslation implements Node {
      source: String
      translation: String
      langcode: String
    }
  `)
}

const processTranslation = (langcode, source, translation) => {
  // Translation-specific object
  const singleTranslation = {
    source: source,
    translation: translation,
    langcode: langcode,
  }

  // Gatsby node metadata
  const nodeContent = JSON.stringify(singleTranslation)

  const nodeMeta = {
    parent: null,
    children: [],
    internal: {
      type: `DrupalTranslation`,
      mediaType: `text/json`,
      content: nodeContent,
    },
  }

  return Object.assign({}, singleTranslation, nodeMeta)
}
