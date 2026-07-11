import { defineCollection } from "astro:content";

const lessons = defineCollection({ type: "data" });

export const collections = { lessons };
