import signale from "signale"
import getGoogleSpreadsheet from "./getGoogleSpreadsheet"

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Unknown error"
}

export const sendMessage = async (message: string) => {
  const doc = await getGoogleSpreadsheet()

  const sheet = doc.sheetsByTitle["管理"]
  await sheet.addRow([new Date().toLocaleString("ja-JP"), message])
}

export const sendError = (error: unknown) => {
  signale.error(error)
  return sendMessage(getErrorMessage(error))
}
