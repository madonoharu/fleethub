import { NextComponentType, NextPageContext } from "next";
import { ErrorProps } from "next/error";
import React from "react";

const ErrorPage: NextComponentType<NextPageContext, {}, ErrorProps> = ({
  statusCode,
  title,
}) => <p>{statusCode}</p>;

export default ErrorPage;
