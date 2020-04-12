import React from "react"
import styled from "styled-components"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import { Proficiency } from "@fleethub/core"

import Typography from "@material-ui/core/Typography"

import { ProficiencyIconsQuery } from "../../../graphqlTypes"

const Exp = styled(Typography)`
  position: absolute;
  font-size: 10px;
  bottom: 0;
  right: 0;
  line-height: 1;
  background: rgba(128, 64, 64, 0.6);
  border-radius: 2px;
`

const imgStyle = { objectFit: "contain" }

type ProficiencyIconProps = Pick<React.ComponentProps<"div">, "className" | "onClick"> & {
  exp: number
}

const ProficiencyIcon = React.forwardRef<HTMLDivElement, ProficiencyIconProps>((props, ref) => {
  const { exp, ...divProps } = props
  const level = Proficiency.expToLevel(exp)

  const { allFile } = useStaticQuery<ProficiencyIconsQuery>(graphql`
    query ProficiencyIcons {
      allFile(filter: { relativeDirectory: { eq: "proficiency" } }) {
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

  const childImageSharp = allFile.edges.find((n) => n.node.name === level.toString())?.node.childImageSharp

  let img: React.ReactNode = null
  if (childImageSharp) {
    img = <Img className={divProps.className} fixed={childImageSharp.fixed} imgStyle={imgStyle} />
  }

  return (
    <div ref={ref} {...divProps}>
      {img}
      <Exp>{exp}</Exp>
    </div>
  )
})

export default styled(ProficiencyIcon)`
  display: block !important;
  filter: brightness(110%) contrast(110%) saturate(100%);
`
