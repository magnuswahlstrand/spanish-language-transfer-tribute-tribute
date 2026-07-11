import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.ASTRO_SITE || "http://localhost:4321",
  base: process.env.ASTRO_BASE || "/",
  output: "static",
  build: {
    format: "directory",
  },
});
