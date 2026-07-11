import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.ASTRO_SITE || "https://wahlstrand.dev",
  base: process.env.ASTRO_BASE || "/spanish-language-transfer-tribute-tribute",
  output: "static",
  build: {
    format: "directory",
  },
});
