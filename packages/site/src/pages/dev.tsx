/** @jsxImportSource @emotion/react */
import { Button, Container } from "@mui/material";
import localforage from "localforage";
import type { NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import React from "react";

const Dev: NextComponentType<NextPageContext> = () => (
  <div>
    <Head>
      <title>作戦室</title>
      <meta
        name="description"
        content="作戦室は艦これの編成を支援するサイトです。弾着率、対地火力などの計算が行えます。"
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content="@MadonoHaru" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Container sx={{ mt: 5 }}>
      <Button
        size="large"
        variant="outlined"
        onClick={() => localforage.clear()}
      >
        全てのデータを削除する
      </Button>
    </Container>
  </div>
);

export default Dev;
