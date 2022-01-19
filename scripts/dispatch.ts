import { updateMasterDataBySpreadsheet, updateImages } from "@fh/admin/src";

type ClientPayload = {
  type: string;
};

const isClientPayload = (payload: unknown): payload is ClientPayload =>
  typeof payload === "object" && payload !== null && "type" in payload;

const getClientPayload = (): ClientPayload => {
  const { CLIENT_PAYLOAD } = process.env;

  const payload: unknown = CLIENT_PAYLOAD && JSON.parse(CLIENT_PAYLOAD);

  if (!isClientPayload(payload)) {
    throw Error("CLIENT_PAYLOAD is not found");
  }

  return payload;
};

const main = async () => {
  const type = getClientPayload()?.type;

  if (type === "update_data") {
    await updateMasterDataBySpreadsheet();
  }

  if (type === "update_images") {
    await updateImages();
  }
};

main().catch((err) => console.error(err));
