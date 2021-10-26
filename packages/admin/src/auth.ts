import { OAuth2Client, TokenPayload } from "google-auth-library";

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
