import { NextApiHandler } from "next";

const locate: NextApiHandler = async (req, res) => {
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

export default locate;
