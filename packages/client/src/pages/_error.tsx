import React from "react"
import { NextComponentType, NextPageContext } from "next"
import { ErrorProps } from "next/error"

const ErrorPage: NextComponentType<NextPageContext, {}, ErrorProps> = ({ statusCode, title }) => <p>{statusCode}</p>

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode || err?.statusCode

  return {
    namespacesRequired: ["common"],
    statusCode,
  }
}

export default ErrorPage
