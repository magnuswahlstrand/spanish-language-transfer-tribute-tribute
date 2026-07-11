# Language Transfer Tribute TRIBUTE

[Language Transfer](https://www.languagetransfer.org/) is probably the best resource I have found for learning Spanish speaking.
[Language Transfer Tribute](https://languagetransfertribute.com/) (not this page) is an overview of lessons 1–68 from the Language Transfer course, with notes, translations, and audio. A very useful (non-affiliated) addition to the audio only course!

The tribute page, while awesome, lacked a few things I wanted:

- It doesn't support HTTPS, making it harder to access in modern browsers.
- There is no overview page suitable for printing — making printing harder.
- Lessons 69–90 are missing for some reason.

This Tribute TRIBUTE aims to improve those shortcomings.

You can support Language Transfer at [Patreon](https://www.patreon.com/languagetransfer) or [PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=T54HRGDW4TVBN&source=url).

## Pages

- `/all/` — all sentence pairs in one table (print-friendly)
- `/cheat-sheets/` — key concepts, verbs, vocabulary grouped by lesson range

## Development

```sh
pnpm install
pnpm dev       # dev server
pnpm build     # static build → dist/
pnpm validate  # schema + data checks
pnpm test      # full test suite
pnpm import:lesson 21-68   # import from tribute site
```

## Stack

Astro, TypeScript, Vitest, plain CSS. No framework, no database, no backend.
