# Language Transfer Tribute TRIBUTE

This is a tribute to the [Language Transfer Tribute](https://languagetransfertribute.com/) — the excellent fan-made site that transcribed the [Complete Spanish](https://www.languagetransfer.org/) course by Mihalis Eleftheriou. We are deeply grateful for that work.

The original tribute site is comprehensive but has no single-page overview of all lessons and isn't available over HTTPS, making it less accessible in some networks. This project reorganises the same material into a static, printable reference with sentence tables, cheat sheets, and a compact all-lessons page.

If you find this useful, please support [Language Transfer](https://www.languagetransfer.org/support) — the real project behind the Thinking Method.

## Pages

- `/all/` — all sentence pairs in one table
- `/cheat-sheets/N-M/` — grouped cheat sheets for lesson ranges

## Development

```sh
pnpm install
pnpm dev       # dev server
pnpm build     # static build → dist/
pnpm validate  # schema + data checks
pnpm test      # full test suite
pnpm import:lesson 1-20   # import from tribute site
```

## Stack

Astro, TypeScript, Vitest, plain CSS. No framework, no database, no backend.

## Deployment

Set `ASTRO_SITE` and `ASTRO_BASE` when building for a subpath deployment. See `.github/workflows/deploy.yml`.
