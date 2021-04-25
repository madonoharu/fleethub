import { GoogleSpreadsheet } from "google-spreadsheet";

import getServiceAccount from "./getServiceAccount";

const doc = new GoogleSpreadsheet(
  "1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA"
);

let initialized = false;

export default async () => {
  if (initialized) return doc;

  const serviceAccount = getServiceAccount();
  await doc.useServiceAccountAuth(serviceAccount);
  await doc.loadInfo();

  initialized = true;

  return doc;
};
