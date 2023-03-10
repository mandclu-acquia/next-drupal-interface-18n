import { graphql, useStaticQuery } from "gatsby"

// @otodo rewrite this to not use GraphQL.
export const useDrupalTranslations = () => {
  const data = useStaticQuery(
    graphql`
      query DrupalTranslations {
        allDrupalTranslation {
          nodes {
            source
            translation
            langcode
          }
        }
      }
    `
  )
  return data.allDrupalTranslation.nodes
}
