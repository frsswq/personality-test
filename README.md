# personality-test

Free online psychological tests that use open, public-domain question sets.

The site is client-rendered React and scores answers in the browser.
There are no accounts and no server-side storage of answers.
The site runs on the Cloudflare free plan as Worker static assets.

Status: Phase 0 is complete.
See [docs/PLAN.md](docs/PLAN.md) for the full plan.

## Stack

- React 19 with React Router 8 in framework mode, `ssr: false`.
- Vite and Tailwind CSS v4.
- shadcn/ui with the Base UI base and the `base-nova` style.
- Ultracite with Oxlint, Oxfmt, and `@shadcn/lint`.
- Vitest and React Testing Library.
- Cloudflare Workers static assets.

## Commands

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `bun install`       | Install dependencies.                        |
| `bun run dev`       | Start the dev server.                        |
| `bun run build`     | Build the client bundle into `build/client`. |
| `bun run test`      | Run the tests once.                          |
| `bun run typecheck` | Run React Router typegen and TypeScript.     |
| `bun run check`     | Run the lint and format check.               |
| `bun run fix`       | Apply lint and format fixes.                 |
| `bun run deploy`    | Build and deploy to the Worker.              |

## Sources

The question sets come from the International Personality Item Pool (IPIP), which is in the public domain.
See section 4 of the plan for the licence review of every instrument.
