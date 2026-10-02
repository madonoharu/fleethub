# Browser migration regressions

Use Bun 1.4.2 to run Playwright, its test workers and Next.js. The application
uses the published npm Wasm package, so browser tests do not require Rust or
wasm-pack. If using mise, install Bun and activate it in your shell first:

```sh
mise trust
mise install --locked bun
```

With Bun on PATH, run:

```sh
bun install --frozen-lockfile
bun run playwright install --with-deps chromium
bun run build
bun run test:e2e
```

The default configuration starts the existing production build with `bun run
start` on `http://localhost:3000`; it never builds implicitly. Tests run in fresh
browser contexts, with two workers by default. Set `E2E_WORKERS` to adjust this.
The root `bunfig.toml` sets `[run] bun = true`. The `.mts` configuration and
the ESM boundary in `tests/e2e/package.json` let Bun load the TypeScript tests
natively. If invoking Playwright with `bunx`, use `bunx --bun playwright`.

For a separate development checkout, run setup first:

```sh
bun run setup
bun run test:e2e:dev
```

To test an already running server without starting another:

```sh
E2E_BASE_URL=http://localhost:3000 bun run test:e2e
```

When that external server is a development server, also set `E2E_MODE=dev`.
The suite asserts that production requests `master_data.json` and development
requests `master_data.dev.json`.

The five direct locale tests each initialize their own page, translations and
Wasm runtime. They also verify that MUI's SSR styles stay in the head and that
Emotion hydrates the CSS layer-order rule. Another test changes languages through the real menu. Fleet tests
assert exact Rust-generated LOS scores after changing HQ level, including both
numeric bounds, and after selecting a real ship. The persistence test creates a folder and plan, uses tree
keyboard navigation, waits for the actual IndexedDB save, and reloads.

Tailwind styles are verified in Chromium with the application's generated CSS.
The selection tests check initial focus, immediate search input, Escape and
focus restoration, search-clear visibility before/after hover, and the dialog's
desktop/narrow dimensions. Fleet tests check hover-only numeric controls; the
persistence test checks the nested tree row's highlight/hit area. The damage
test checks the custom-modifier button's icon alignment and the chart tooltip's
readable background after hovering. These style assertions belong in browser
tests because the DOM test runner does not load Next.js's generated CSS.

The sidebar test creates enough folders to scroll, wheels the tree, and checks
that individual rows and the toolbar do not become nested scroll containers.
It also checks that the drop outline can extend beyond its label. The touch
selection test uses a mobile context without a hover-capable pointer to verify
that search clearing and one-step numeric adjustment remain usable.

The preset test deletes the selected final row, verifies that the remaining
preset stays editable, then deletes everything and registers another preset.
The damage test also checks the nested tabs' 32px height and the ship details
distribution headings' 8px gap below their tables.

The damage-chart regression equips Akagi Kai with a Suisei bomber, imports a
deterministic map containing enemy ship 1501, and opens the damage distribution.
It checks the real Wasm attack report's 146–148 normal and 267–269 critical
damage ranges, nonempty finite SVG geometry and numeric axes, then asserts the
no-penetration filter's changed checkbox state. Equipment icon requests
on the specific Cloudinary `gear_icons` path receive an inert image. The chart
and Rust analysis are not mocked.

Browser master-data requests use the checked-in fixture below. Application
JavaScript, locale bundles and Wasm are served by Next.js unchanged. Analytics
requests receive inert successful responses; unexpected external requests and
browser errors fail the tests. React-Redux warnings about selectors returning
different results for the same state also fail the tests. Next.js build and server metadata generation
still use the application's public GCS generation-map request.

## Master-data fixture

`fixtures/master-data.json` is a reduced snapshot of the public
`https://storage.googleapis.com/kcfleethub/data/master_data.json`, captured on
2026-10-02. The uncompressed source's SHA-256 is
`1ad12a02ee0400065fa8222a458c693aff4427e3f0b99f6729793291dd0a4142`;
`created_at` is `1789858784283`.

The reduction keeps ships 277 and 599 (Akagi Kai and Akagi Kai Ni E), gears 16,
21 and 24, all attribute and improvement rules, and all formation/cutin
definitions. Historical bonuses are removed. Equippability keeps ship type 11,
ship-specific entries for the retained ships, and extra-slot entries for the
retained gears. Other equippability rules remain intact. This is public game
data; no `.private` files or generated Rust download caches are used at runtime.

The fixture makes these migration regressions deterministic. It does not verify
compatibility with future changes to the live upstream master data.

`fixtures/enemy-1501.json` retains the public snapshot's Destroyer I-class
(駆逐イ級), with the same source, capture date, hash and `created_at` above. Its
stock equipment is cleared so it needs no additional gear fixture.
`fixtures/map-11.json` is a minimal synthetic map with one node and that enemy
in Line Ahead formation. The chart test composes these fixtures with the
existing master-data fixture; it does not duplicate the full snapshot or fetch
a live map.
