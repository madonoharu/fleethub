import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import styled from "styled-components"

import { StatIconsQuery } from "../../../graphqlTypes"

type Props = {
  icon: string
}

const StatIcon: React.FCX<Props> = ({ className, icon }) => {
  const { allFile } = useStaticQuery<StatIconsQuery>(graphql`
    query StatIcons {
      allFile(filter: { relativeDirectory: { eq: "stats" } }) {
        edges {
          node {
            name
            childImageSharp {
              fixed(height: 15) {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      }
    }
  `)

  const childImageSharp = allFile.edges.find((n) => n.node.name === icon)?.node.childImageSharp

  if (!childImageSharp) return null

  return <Img className={className} fixed={childImageSharp.fixed} />
}

export default styled(StatIcon)`
  filter: contrast(180%) opacity(0.9);
`
