import { AssetServiceClient } from "@google-cloud/asset";
import { OAuth2Client, TokenPayload } from "google-auth-library";

import { getServiceAccount } from "./credentials";

const GAS_AUDIENCE = `15771378938-epuef1jsf5vaboq65qevv3moa0cksrsi.apps.googleusercontent.com`;

async function getMembers(): Promise<string[] | undefined> {
  const assetServiceClient = new AssetServiceClient({
    credentials: getServiceAccount(),
  });

  const [response] = await assetServiceClient.analyzeIamPolicy({
    analysisQuery: {
      scope: "projects/kcfleethub",
      accessSelector: {
        roles: ["roles/viewer", "roles/editor", "roles/owner"],
      },
    },
  });

  return response.mainAnalysis?.analysisResults
    ?.flatMap((result) => result?.iamBinding?.members)
    .filter((member): member is string => Boolean(member))
    .map((member) => member.toLowerCase());
}

async function verifyGasIdToken(
  idToken: string
): Promise<TokenPayload | undefined> {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: GAS_AUDIENCE,
  });

  return ticket.getPayload();
}

export async function isProjectMember(idToken: string): Promise<boolean> {
  const [members, tokenPayload] = await Promise.all([
    getMembers(),
    verifyGasIdToken(idToken),
  ]);

  const email = tokenPayload?.email;

  if (!members || !email) {
    return false;
  }

  return members.includes(`user:${email}`);
}
