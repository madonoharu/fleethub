import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import type { NextApiRequest, NextApiResponse } from "next";

import locate from "./locate";

const originalFetch = globalThis.fetch;

const createResponse = () => {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    setHeader(name: string, value: string) {
      res.headers[name] = value;
      return res;
    },
  };
  return res;
};

const call = async (url: unknown) => {
  const res = createResponse();
  await locate({ query: { url } } as unknown as NextApiRequest, res as unknown as NextApiResponse);
  return res;
};

describe("api/locate", () => {
  let fetchMock: ReturnType<typeof mock>;

  beforeEach(() => {
    fetchMock = mock(
      async () =>
        new Response(null, { status: 302, headers: { location: "https://example.com/long" } }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it.each([
    ["missing", undefined],
    ["array", ["https://jervis.page.link/a", "https://jervis.page.link/b"]],
    ["not a url", "not a url"],
    ["other host", "https://example.com/a"],
    ["internal host", "http://127.0.0.1/a"],
    ["ftp scheme", "ftp://jervis.page.link/a"],
    ["lookalike host", "https://jervis.page.link.evil.com/a"],
    ["userinfo host", "https://jervis.page.link@evil.com/a"],
    ["custom port", "https://jervis.page.link:8443/a"],
  ])("returns 400 without fetching for %s", async (_name, url) => {
    const res = await call(url);

    expect(res.statusCode).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("expands a short url with a cacheable response", async () => {
    const res = await call("https://jervis.page.link/abc");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ url: "https://example.com/long" });
    expect(res.headers["Cache-Control"]).toContain("s-maxage=");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("https://jervis.page.link/abc");
  });

  it("expands an http short url over https", async () => {
    const res = await call("http://jervis.page.link/abc");

    expect(res.statusCode).toBe(200);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("https://jervis.page.link/abc");
  });

  it("returns 404 without cache headers when there is no redirect", async () => {
    fetchMock.mockImplementation(async () => new Response(null, { status: 404 }));
    const res = await call("https://jervis.page.link/abc");

    expect(res.statusCode).toBe(404);
    expect(res.headers["Cache-Control"]).toBeUndefined();
  });

  it("returns 502 when fetch fails", async () => {
    fetchMock.mockImplementation(async () => {
      throw new Error("network");
    });
    const res = await call("https://jervis.page.link/abc");

    expect(res.statusCode).toBe(502);
    expect(res.headers["Cache-Control"]).toBeUndefined();
  });
});
