import {
  cert,
  getApp as getFirebaseApp,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import type { CredentialBody } from "google-auth-library";

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
  } satisfies CredentialBody & { project_id: string };
};

export const getApp = () => {
  if (!getApps().some((app) => app.name === "[DEFAULT]")) {
    const { project_id, client_email, private_key } = getServiceAccount();

    return initializeApp({
      credential: cert({
        projectId: project_id,
        clientEmail: client_email,
        privateKey: private_key,
      }),
      storageBucket: "kcfleethub",
    });
  }

  return getFirebaseApp();
};
