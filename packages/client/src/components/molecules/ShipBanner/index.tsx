import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import { ShipImagesQuery } from "../../../graphqlTypes"

type Props = {
  shipId: number
}

const Component: React.FC<Props> = ({ shipId }) => {
  const { allFile } = useStaticQuery<ShipImagesQuery>(graphql`
    query ShipImages {
      allFile(filter: { relativeDirectory: { eq: "ships" } }) {
        edges {
          node {
            name
            childImageSharp {
              fixed(width: 120) {
                ...GatsbyImageSharpFixed_withWebp
              }
            }
          }
        }
      }
    }
  `)

  const childImageSharp = allFile.edges.find((n) => n.node.name === shipId.toString())?.node.childImageSharp

  if (!childImageSharp) return <Img fixed={allFile.edges[0].node.childImageSharp?.fixed} />

  return <Img fixed={childImageSharp.fixed} />
}

export default Component
