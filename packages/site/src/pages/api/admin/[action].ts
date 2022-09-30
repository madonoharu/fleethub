import {
  isProjectMember,
  updateImages,
  updateMasterDataBySpreadsheet,
} from "@fh/admin";
import { measure } from "@fh/utils";
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

  const login = await measure("isProjectMember", () =>
    isProjectMember(idToken)
  );

  if (!login) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ error: getReasonPhrase(StatusCodes.FORBIDDEN) });
  }

  if (req.query.action === "update-master-data") {
    await updateMasterDataBySpreadsheet();
  } else if (req.query.action === "update-images") {
    await updateImages();
  } else {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: getReasonPhrase(StatusCodes.NOT_FOUND) });
  }

  return res
    .status(StatusCodes.OK)
    .json({ message: getReasonPhrase(StatusCodes.OK) });
};

export default updateMasterData;
