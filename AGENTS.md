# Agent Instructions

## Commands

Run all of these before a commit that changes code.

- `bun run check` for lint and format.
- `bun run test` for tests.
- `bun run typecheck` for types.
- `bun run build` for the production build.

## Conventions

- Commit every checkpoint with a Conventional Commit message.
- Write repository documents in ASD-STE100 Simplified Technical English.
- Put each full sentence on its own physical line in Markdown.
  Oxfmt keeps this layout through `proseWrap: "preserve"`, so never set it back to `never`.
- Never use the em dash character.
  Use a plain dash.
- Ship only instruments whose licence is public domain, Creative Commons, or free with attribution.
  The licence gate is in `docs/PLAN.md` section 4.

## shadcn/ui

- The component base is Base UI.
  Use the `render` prop, not `asChild`.
- Components live in `app/components/ui`, and they keep their upstream style.
  The lint rules that conflict with that style are off for the directory in `oxlint.config.ts`.
- Update a component with `bunx --bun shadcn@latest add <name> --dry-run` and `--diff` before you apply a change.
- Run `bunx --bun shadcn@latest info` for the current aliases and the installed component list.
