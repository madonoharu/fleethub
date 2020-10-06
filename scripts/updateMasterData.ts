import admin from "firebase-admin"
import { ServiceAccountCredentials } from "google-spreadsheet"

import { updateByStart2 } from "./data"

const { SERVICE_ACCOUNT_CLIENT_EMAIL: client_email, SERVICE_ACCOUNT_PRIVATE_KEY: private_key } = process.env

if (!client_email) throw Error("client_emailが存在しません")
if (!private_key) throw Error("private_keyが存在しません")

const serviceAccount = {
  project_id: "kcfleethub",
  client_email,
  private_key: private_key.replace(/\\n/g, "\n"),
} as ServiceAccountCredentials & admin.ServiceAccount

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "kcfleethub.appspot.com",
})

updateByStart2
