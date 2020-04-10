import React from "react"
import styled from "styled-components"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import { ShipImagesQuery } from "../../../graphqlTypes"

type Props = {
  shipId: number
}

const ShipBanner: React.FCX<Props> = ({ className, shipId }) => {
  const { allFile } = useStaticQuery<ShipImagesQuery>(graphql`
    query ShipImages {
      allFile(filter: { relativeDirectory: { eq: "ships" } }) {
        edges {
          node {
            name
            childImageSharp {
              fixed(height: 24) {
                ...GatsbyImageSharpFixed_withWebp
              }
            }
          }
        }
      }
    }
  `)

  const childImageSharp = allFile.edges.find((n) => n.node.name === shipId.toString())?.node.childImageSharp

  if (!childImageSharp) return <Img className={className} fixed={allFile.edges[0].node.childImageSharp?.fixed} />

  return <Img className={className} fixed={childImageSharp.fixed} />
}

export default styled(ShipBanner)``
