import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // Repository docs keep one sentence per physical line. Ultracite sets
  // `proseWrap: "never"`, which merges each paragraph into a single line.
  proseWrap: "preserve",
});
