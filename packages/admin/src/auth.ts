import { AssetServiceClient } from "@google-cloud/asset";
import { OAuth2Client, TokenPayload } from "google-auth-library";

import { getServiceAccount } from "./credentials";

const GAS_AUDIENCE = `15771378938-epuef1jsf5vaboq65qevv3moa0cksrsi.apps.googleusercontent.com`;

export const verifyGasIdToken = async (
  idToken: string
): Promise<TokenPayload | undefined> => {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: GAS_AUDIENCE,
  });

  return ticket.getPayload();
};

export const isProjectMember = async (idToken: string) => {
  const email = (await verifyGasIdToken(idToken))?.email;

  const assetServiceClient = new AssetServiceClient({
    credentials: getServiceAccount(),
  });

  const [analyzeIamPolicyResponse] = await assetServiceClient.analyzeIamPolicy({
    analysisQuery: {
      scope: "projects/kcfleethub",
      accessSelector: {
        roles: ["roles/viewer", "roles/editor", "roles/owner"],
      },
    },
  });

  const members = analyzeIamPolicyResponse.mainAnalysis?.analysisResults
    ?.flatMap((result) => result?.iamBinding?.members)
    .filter((member): member is string => Boolean(member))
    .map((member) => member.toLowerCase());

  if (!members || !email) {
    return false;
  }

  return members.includes(`user:${email}`);
};
