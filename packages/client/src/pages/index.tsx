import React from "react"
import Head from "next/head"
import type { NextComponentType } from "next"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import { AppContent } from "../components"
import { StoreProvider } from "../store"

const Inner = React.memo(() => (
  <DndProvider backend={HTML5Backend}>
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  </DndProvider>
))

const Index: NextComponentType = () => {
  return (
    <div>
      <Head>
        <title>作戦室</title>
        <meta
          name="description"
          content="作戦室 Jervis改は艦これの編成を支援するサイトです。弾着率、対地火力などの計算が行えます。"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@MadonoHaru" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Inner />
    </div>
  )
}

Index.getInitialProps = () => ({
  namespacesRequired: ["common"],
})

export default Index
