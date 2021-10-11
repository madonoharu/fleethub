// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiHandler } from "next";

const hello: NextApiHandler = async (req, res) => {
  const { url } = req.query;

  if (typeof url !== "string") {
    res.statusCode = 400;
    return;
  }

  const kcjUrl = (await fetch(url, { redirect: "manual" })).headers.get(
    "location"
  );

  res.statusCode = 200;
  res.json({ url: kcjUrl });
};

export default hello;
