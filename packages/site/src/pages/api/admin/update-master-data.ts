import { isProjectMember, updateMasterDataBySpreadsheet } from "@fh/admin";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";

const updateMasterData: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .json({ error: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED) });
  }

  const idToken = (req.body as { id_token: string }).id_token;

  if (typeof idToken !== "string") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: getReasonPhrase(StatusCodes.BAD_REQUEST) });
  }

  const login = await isProjectMember(idToken);

  if (!login) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ error: getReasonPhrase(StatusCodes.FORBIDDEN) });
  }

  await updateMasterDataBySpreadsheet();

  return res.status(StatusCodes.OK).json({ message: "ok" });
};

export default updateMasterData;
