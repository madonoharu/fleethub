import admin from "firebase-admin";
import {
  GoogleSpreadsheet,
  ServiceAccountCredentials,
} from "google-spreadsheet";

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

const doc = new GoogleSpreadsheet(
  "1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA"
);

let initialized = false;

export const getGoogleSpreadsheet = async () => {
  if (initialized) return doc;

  const serviceAccount = getServiceAccount();
  await doc.useServiceAccountAuth(serviceAccount);
  await doc.loadInfo();

  initialized = true;

  return doc;
};
