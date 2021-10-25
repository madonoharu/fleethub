import { log, updateData, updateImages } from "@fh/admin/src";

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

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

const main = async () => {
  const type = getClientPayload()?.type;

  try {
    await log(`${type}: Start`);

    if (type === "update_data") {
      await updateData();
    }

    if (type === "update_images") {
      await updateImages();
    }

    await log(`${type}: Success`);
  } catch (error) {
    await log(getErrorMessage(error));
  }
};

main().catch((err) => console.error(err));
