import { Org } from "@fleethub/core";

const getPredeckUrl = (base: string, org: Org) => {
  const url = new URL(base);
  // const deck = getDeck4(org);

  // url.searchParams.set("predeck", JSON.stringify(deck));
  // if (url.href.length < 7900) return url.href;

  // delete deck.f4;
  // url.searchParams.set("predeck", JSON.stringify(deck));
  // if (url.href.length < 7900) return url.href;

  // delete deck.f3;
  // url.searchParams.set("predeck", JSON.stringify(deck));
  return url.href;
};

export const openKctools = (org: Org) => {
  const url = getPredeckUrl("https://noro6.github.io/kcTools/", org);
  window.open(url, "_blank", "noopener");
};

export const openDeckbuilder = (org: Org) => {
  const url = getPredeckUrl("http://kancolle-calc.net/deckbuilder.html", org);
  window.open(url, "_blank", "noopener");
};
