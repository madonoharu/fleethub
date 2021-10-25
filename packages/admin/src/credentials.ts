import admin from "firebase-admin";
import { ServiceAccountCredentials } from "google-spreadsheet";

export const getServiceAccount = () => {
  const {
    SERVICE_ACCOUNT_CLIENT_EMAIL: client_email,
    SERVICE_ACCOUNT_PRIVATE_KEY: private_key,
  } = process.env;

  if (!client_email) throw Error("client_emailが存在しません");
  if (!private_key) throw Error("private_keyが存在しません");

  return {
    project_id: "kcfleethub",
    client_email,
    private_key: private_key.replace(/\\n/g, "\n"),
  } as ServiceAccountCredentials & admin.ServiceAccount;
};
