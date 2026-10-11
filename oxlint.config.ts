import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, vitest, shadcn],
  ignorePatterns: core.ignorePatterns,
  // Re-declared on the root so dependency analyzers can see the plugin.
  jsPlugins: shadcn.jsPlugins,
  overrides: [
    {
      files: ["app/components/ui/**"],
      rules: {
        // Vendored shadcn components keep their upstream style, so that
        // `shadcn add --diff` stays a readable merge.
        "func-style": "off",
        "no-use-before-define": "off",
        "react/function-component-definition": "off",
        "sort-keys": "off",
      },
    },
  ],
});
