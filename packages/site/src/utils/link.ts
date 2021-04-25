import { getDeck4, Plan } from "@fleethub/core";

const getPredeckUrl = (base: string, plan: Plan) => {
  const url = new URL("https://noro6.github.io/kcTools/");
  const deck = getDeck4(plan);

  url.searchParams.set("predeck", JSON.stringify(deck));
  if (url.href.length < 7900) return url.href;

  delete deck.f4;
  url.searchParams.set("predeck", JSON.stringify(deck));
  if (url.href.length < 7900) return url.href;

  delete deck.f3;
  url.searchParams.set("predeck", JSON.stringify(deck));
  return url.href;
};

export const openKctools = (plan: Plan) => {
  const url = getPredeckUrl("https://noro6.github.io/kcTools/", plan);
  window.open(url, "_blank", "noopener");
};

export const openDeckbuilder = (plan: Plan) => {
  const url = getPredeckUrl("http://kancolle-calc.net/deckbuilder.html", plan);
  window.open(url, "_blank", "noopener");
};
