import { NextApiHandler } from "next";

const SHORT_URL_HOST = "jervis.page.link";
const SHORT_URL_PROTOCOLS = ["https:", "http:"];
const FETCH_TIMEOUT_MS = 5000;

const parseShortUrl = (value: unknown) => {
  if (typeof value !== "string") return undefined;

  const url = URL.parse(value);
  if (
    url === null ||
    !SHORT_URL_PROTOCOLS.includes(url.protocol) ||
    url.hostname !== SHORT_URL_HOST ||
    url.port !== ""
  ) {
    return undefined;
  }

  url.protocol = "https:";
  return url;
};

const fetchLocation = (url: URL) =>
  fetch(url, { redirect: "manual", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).then(
    (response) => response.headers.get("location"),
    () => undefined,
  );

const locate: NextApiHandler = async (req, res) => {
  const shortUrl = parseShortUrl(req.query.url);
  if (shortUrl === undefined) {
    res.status(400).json({ error: "invalid url" });
    return;
  }

  const location = await fetchLocation(shortUrl);
  if (location === undefined) {
    res.status(502).json({ error: "failed to fetch" });
    return;
  }
  if (location === null) {
    res.status(404).json({ url: null });
    return;
  }

  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  res.status(200).json({ url: location });
};

export default locate;
