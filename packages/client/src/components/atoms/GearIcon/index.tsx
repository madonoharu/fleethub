import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import styled from "styled-components"

import { GearIconsQuery } from "../../../graphqlTypes"

type Props = {
  iconId: number
}

const GearIcon: React.FCX<Props> = ({ className, iconId }) => {
  const { allFile } = useStaticQuery<GearIconsQuery>(graphql`
    query GearIcons {
      allFile(filter: { relativeDirectory: { eq: "gears" } }) {
        edges {
          node {
            name
            childImageSharp {
              fixed(height: 24) {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      }
    }
  `)

  const childImageSharp = allFile.edges.find((n) => n.node.name === iconId.toString())?.node.childImageSharp

  if (!childImageSharp) return null

  return <Img className={className} fixed={childImageSharp.fixed} />
}

export default styled(GearIcon)``
