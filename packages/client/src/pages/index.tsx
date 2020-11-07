import React from "react"
import Head from "next/head"
import type { NextComponentType } from "next"

import { AppContent } from "../components"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import "../i18n"
import { StoreProvider } from "../store"

const Home: NextComponentType = () => {
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

      <DndProvider backend={HTML5Backend}>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </DndProvider>
    </div>
  )
}

export default Home
