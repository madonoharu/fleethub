import { storage } from "@fh/admin";
import { StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";

// eslint-disable-next-line @typescript-eslint/require-await
const publish: NextApiHandler = async (req, res) => {
  const body: unknown = req.body;

  if (typeof body !== "object" || body === null) {
    res.status(StatusCodes.BAD_REQUEST).end();
    return;
  }

  const { hash, data } = body as { hash: string; data: object };

  await storage.writeJson(`public/${hash}.json`, data, {
    public: true,
    immutable: true,
  });

  res.status(StatusCodes.OK).end();
};

export default publish;
