import type { Kc3BonusFile } from "@fh/utils";
import ky from "ky";

export type { Kc3Bonus, Kc3BonusFile, Kc3BonusGroup, Kc3Debuff, Kc3DebuffGroup } from "@fh/utils";
export { getMapKey } from "@fh/utils";

const REPO = "KC3Kai/kancolle-replay";
const DIR = "js/data/bonus";

interface GitHubContent {
  name: string;
  type: string;
  download_url: string | null;
}

export async function fetchKc3BonusFiles(): Promise<Kc3BonusFile[]> {
  const contents = await ky
    .get(`https://api.github.com/repos/${REPO}/contents/${DIR}`)
    .json<GitHubContent[]>();

  const urls = contents
    .filter((content) => content.type === "file" && content.name.endsWith(".json"))
    .map((content) => content.download_url)
    .filter((url): url is string => Boolean(url));

  return Promise.all(urls.map((url) => ky.get(url).json<Kc3BonusFile>()));
}
