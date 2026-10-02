# Browser migration regressions

Use Node 24.14.0 (pinned in `package.json` for Volta) and Bun 1.4.2.

```sh
bun install --frozen-lockfile
bunx playwright install --with-deps chromium
bun run build
bunx playwright test
```

The default configuration starts the existing production build with `bun run
start` on `http://localhost:3000`; it never builds implicitly. Tests run in fresh
browser contexts, with two workers by default. Set `E2E_WORKERS` to adjust this.

For a separate development checkout, run setup first:

```sh
bun run setup
E2E_MODE=dev bunx playwright test
```

To test an already running server without starting another:

```sh
E2E_BASE_URL=http://localhost:3000 bunx playwright test
```

When that external server is a development server, also set `E2E_MODE=dev`.
The suite asserts that production requests `master_data.json` and development
requests `master_data.dev.json`.

The five direct locale tests each initialize their own page, translations and
Wasm runtime. Another test changes languages through the real menu. Fleet tests
assert exact Rust-generated LOS scores after changing HQ level, including both
numeric bounds, and after selecting a real ship. The persistence test creates a folder and plan, uses tree
keyboard navigation, waits for the actual IndexedDB save, and reloads.

Browser master-data requests use the checked-in fixture below. Application
JavaScript, locale bundles and Wasm are served by Next.js unchanged. Analytics
requests receive inert successful responses; unexpected external requests and
browser errors fail the tests. Next.js build and server metadata generation
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
