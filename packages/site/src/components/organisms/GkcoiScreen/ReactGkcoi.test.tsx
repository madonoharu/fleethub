import { beforeEach, describe, expect, it, mock } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import type { DeckBuilder, DeckBuilderShip } from "gkcoi";
import { SWRConfig } from "swr";

const generate = mock(() => Promise.resolve(document.createElement("canvas")));
await mock.module("gkcoi", () => ({ generate }));
await mock.module("./CanvasViewer", () => ({
  default: () => <div role="img" aria-label="Generated fleet" />,
}));
await mock.module("../../molecules", () => ({
  ErrorAlert: ({ title }: { title: string }) => <div role="alert">{title}</div>,
}));

const { default: ReactGkcoi } = await import("./ReactGkcoi");

const emptyDeck: DeckBuilder = { theme: "dark", lang: "jp", hqlv: 120 };
const ship: DeckBuilderShip = {
  id: 277,
  lv: 99,
  items: {},
  hp: 77,
  fp: 55,
  tp: 0,
  aa: 79,
  ar: 79,
  asw: 0,
  ev: 69,
  los: 89,
  luck: 12,
};
const populatedDeck: DeckBuilder = { ...emptyDeck, f2: { s7: ship } };

function setup(deck: DeckBuilder) {
  const cache = new Map();
  return render(<ReactGkcoi deck={deck} />, {
    wrapper: ({ children }) => (
      <SWRConfig value={{ provider: () => cache, shouldRetryOnError: false }}>{children}</SWRConfig>
    ),
  });
}

beforeEach(() => {
  generate.mockClear();
});

describe("fleet image empty state", () => {
  it.each([
    ["empty organization", emptyDeck],
    ["airbase only", { ...emptyDeck, a1: { items: { i1: { id: 24 } } } }],
    ["filtered enemy fleet", { ...emptyDeck, f1: {} }],
  ] as const)(
    "explains how to generate an image for %s without starting it",
    async (_name, deck) => {
      const view = setup(deck);

      expect(screen.getByRole("alert")).toHaveTextContent(
        "画像を生成するには、艦隊に艦娘を追加してください。",
      );
      expect(generate).not.toHaveBeenCalled();
      expect(screen.queryByRole("progressbar")).toBeNull();

      view.rerender(<ReactGkcoi deck={populatedDeck} />);
      await screen.findByRole("img", { name: "Generated fleet" });
      expect(generate).toHaveBeenCalledTimes(1);
      expect(generate).toHaveBeenCalledWith(populatedDeck);
    },
  );

  it("clears the previous image when the final ship is removed and reuses it after undo", async () => {
    const view = setup(populatedDeck);
    await screen.findByRole("img", { name: "Generated fleet" });

    view.rerender(<ReactGkcoi deck={emptyDeck} />);
    expect(screen.getByRole("alert")).toHaveTextContent("艦娘を追加してください");
    expect(screen.queryByRole("img")).toBeNull();

    view.rerender(<ReactGkcoi deck={populatedDeck} />);
    await waitFor(() => expect(screen.getByRole("img")).toBeInTheDocument());
    expect(generate).toHaveBeenCalledTimes(1);
  });
});
