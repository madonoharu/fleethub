/** @jsxImportSource @emotion/react */
import { NextComponentType, NextPageContext } from "next";
import { ErrorProps } from "next/error";
import React from "react";

const ErrorPage: NextComponentType<NextPageContext, unknown, ErrorProps> = ({
  statusCode,
}) => <p>{statusCode}</p>;

export default ErrorPage;
