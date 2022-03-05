import { Button, Container } from "@mui/material";
import localforage from "localforage";
import type { NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import React from "react";

const Help: NextComponentType<NextPageContext> = () => (
  <div>
    <Head>
      <title>Help</title>
    </Head>

    <Container sx={{ mt: 5 }}>
      <Button
        size="large"
        variant="outlined"
        onClick={() => {
          void localforage.clear();
        }}
      >
        全てのデータを削除する
      </Button>
    </Container>
  </div>
);

export default Help;
