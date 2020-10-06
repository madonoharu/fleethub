import program from "commander"
import admin from "firebase-admin"
import { ServiceAccountCredentials } from "google-spreadsheet"

program.option("--client_email <string>").option("--private_key <string>").parse(process.argv)

const { client_email, private_key } = program

if (typeof client_email === "string" && typeof private_key === "string") {
  const serviceAccount = {
    project_id: "kcfleethub",
    client_email: "kcfleethub@appspot.gserviceaccount.com",
    private_key: private_key.replace(/\\n/g, "\n"),
  } as ServiceAccountCredentials & admin.ServiceAccount

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "kcfleethub.appspot.com",
  })
}
