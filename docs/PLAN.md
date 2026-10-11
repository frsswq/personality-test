# Plan: Free Online Psychological Testing Site

Status: draft for review.
Owner: Faris Saifuddin.

## 1. Goal

Build a free, public, self-administered psychological testing site on the `farissaifuddin.com` domain.

The site uses open, public-domain question sets.
The site scores answers in the browser.
The site uses shadcn/ui for all interface components.
The site runs on the Cloudflare free plan with no paid services.

## 2. Constraints

- No paid services.
- No user accounts in the first release.
- No server-side storage of personal answers.
- No clinical claims and no diagnosis.
- English first, Bahasa Melayu later.

## 3. Domain and Hosting

The existing `personal-web` project already claims `farissaifuddin.com` and `www.farissaifuddin.com` as custom domains on a Cloudflare Worker.

The test site must therefore use a separate route.
Recommended route: `test.farissaifuddin.com`.

Alternative route: `farissaifuddin.com/tests/*` on the same Worker.
This alternative conflicts with the existing single-page-application fallback, so the subdomain is simpler and safer.

Hosting model:

- Build a fully static site.
- Deploy the output directory with Wrangler as Cloudflare Worker static assets.
- Requests to static assets are free and unlimited.
- Worker script invocations are billed against the free limit of 100,000 requests per day.
- A static, browser-scored site therefore has no request cost.

Wrangler configuration sketch:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "personality-test",
  "compatibility_date": "2026-10-11",
  "assets": { "directory": "./dist" },
  "routes": [{ "pattern": "test.farissaifuddin.com", "custom_domain": true }]
}
```

Sources:
- Cloudflare Workers static assets, billing and limitations: static asset requests are free and unlimited.
- Cloudflare free plan: 100,000 Worker requests per day.

## 4. Instrument Sourcing and Licensing

The core content is the question set.
License review comes before any code.

| Instrument | Items | License | Usable | Notes |
| --- | --- | --- | --- | --- |
| IPIP item pool | 3,000+ | Public domain | Yes | Any purpose, no permission, no fee. |
| IPIP-NEO-120 | 120 | Public domain | Yes | 5 domains, 30 facets, 4 items per facet. Johnson, 2014. |
| IPIP Big Five Factor Markers | 50 | Public domain | Yes | Short general-purpose Big Five test. |
| PHQ-9 / GAD-7 | 9 / 7 | Public domain | Yes | Screening tools. Require strong disclaimers and crisis contacts. |
| HEXACO-PI-R | 60 / 100 | Free for non-profit academic research only | No | Online data collection by the general public is not allowed. |
| MBTI and 16Personalities | - | Proprietary | No | Copyright and trademark risk. |
| Big Five Inventory (BFI-2) | 60 | Not public domain | No | Permission and fee may apply. |

Primary source: `https://ipip.ori.org/`.
The IPIP items and scales are in the public domain.
Users may copy, edit, translate, and use them for any purpose without permission and without a fee.

Item and scoring-key source for IPIP-NEO-120: `https://ipip.ori.org/30FacetNEO-PI-RItems.htm`.
The page lists every item under its facet, with the scoring direction.

Behavioral norms:

- Johnson's IPIP-NEO data repository on OSF holds raw data for the 300-item and 120-item forms.
- Published descriptive statistics give facet and domain means and standard deviations.
- We bundle the norm table with the sample size, sample description, and citation.
- We never invent a norm table.

First-release instrument set:

1. IPIP-NEO-120 as the flagship test.
2. IPIP Big Five Factor Markers 50 as the quick test.

Later instruments, each after its own license check:

- PHQ-9 and GAD-7 in a separate "screening" section with crisis contacts.
- Vocational interest test only if the item license is confirmed.

## 5. Architecture

Static content plus client-side scoring.

- Framework: Astro with React islands.
- UI: shadcn/ui components on Tailwind CSS v4.
- Language: TypeScript with strict mode.
- Scoring: pure TypeScript functions, no network calls.
- Data: instrument files stored in the repository as typed data.
- Validation: parse instrument files at build time with a schema and fail the build on error.
- State: answers held in React state and saved to `localStorage`.
- Sharing: the result encoded in the URL fragment. See section 9 for the saving design.
- Analytics: Cloudflare Web Analytics, which is free and cookieless. Optional.

Why Astro:

- Content pages for search traffic are static HTML with no JavaScript cost.
- Interactive test views are React islands.
- shadcn/ui supports Astro.
- Output is plain static files for Cloudflare static assets.

Fallback option: Vite plus React Router as a single-page application.
This matches the existing `personal-web` stack.
It gives weaker search-engine output for landing pages, so it is second choice.

## 6. Repository Layout

```
personality-test/
  docs/                 Plan, decisions, methodology
  src/
    content/instruments/   Instrument data files (items, facets, norms)
    lib/                   Types, schema, scoring, norms
    components/ui/         shadcn components
    components/test/       Test runner and result views
    pages/                 Astro pages
  tests/                 Scoring and data tests
  wrangler.jsonc
  astro.config.mjs
  components.json
```

The project is its own git repository, in the same style as the sibling projects.

## 7. Data Model

The data model is the foundation, so it comes before the interface.

```ts
type LocalizedText = Record<Locale, string>;
type LikertValue = 1 | 2 | 3 | 4 | 5;
type Polarity = "positive" | "negative";

interface Item {
  id: ItemId;
  text: LocalizedText;
  facetId: FacetId;
  polarity: Polarity;
}

interface Facet {
  id: FacetId;
  domainId: DomainId;
  name: LocalizedText;
  description: LocalizedText;
}

interface Domain {
  id: DomainId;
  name: LocalizedText;
  description: LocalizedText;
}

interface Scale {
  id: string;
  labels: Record<LikertValue, LocalizedText>;
}

interface NormTable {
  sample: { n: number; description: string; citation: string };
  facet: Record<FacetId, { mean: number; sd: number }>;
  domain: Record<DomainId, { mean: number; sd: number }>;
}

interface Instrument {
  id: InstrumentId;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  sourceUrl: string;
  license: string;
  citation: string;
  scale: Scale;
  items: Item[];
  facets: Facet[];
  domains: Domain[];
  norms: NormTable | null;
  reporting: ReportingSpec;
}

interface ScoreResult {
  computedAt: string;
  facets: Record<FacetId, TraitScore>;
  domains: Record<DomainId, TraitScore>;
}

interface TraitScore {
  raw: number;
  z: number | null;
  percentile: number | null;
  band: string;
}
```

Design rules:

- Reverse-keyed items carry a `polarity` of `negative`.
- Scoring never mutates input.
- A missing norm table makes percentile fields `null` instead of a guessed value.
- Item text is keyed by locale, so translation adds data and not code.

## 8. Scoring and Norms

Scoring algorithm:

1. Map each answer to a Likert value from 1 to 5.
2. Reverse the value for negative items, using `6 - value`.
3. Sum the items of each facet.
4. Sum the facets of each domain.
5. Convert a raw score to a z-score with the norm mean and standard deviation.
6. Convert the z-score to a percentile with the normal distribution function.
7. Assign a band from the percentile.

Rules:

- Report the raw score next to the percentile.
- Show the norm sample and its citation on the result page.
- Use bands only when a norm table exists.
- Show a plain-language description with each band.
- Do not use clinical labels.

## 9. Flow, Pages, and UX

### The flow

Four steps, with no account at any point.

1. Home. The visitor picks a test.
2. Intro. The page states what the test measures, the item count, the time, and the source. One button: Start.
3. Test. The visitor answers grouped questions. Progress is visible. Answers save automatically.
4. Result. The scores appear at once. The page offers a share link, a download, and a retake.

Rules for the flow:

- No sign-up, no email, and no login.
- No confirmation step after the test.
- The result appears without a button press and without a wait.
- The visitor can leave and return, and the test resumes where it stopped.
- The visitor can retake the test from the result page.

Public pages:

- Home, with the test list.
- Instrument landing page, with a description, item count, duration, and sources.
- Test runner.
- Result page.
- Methodology page, with the scoring rules and citations.
- Licenses and attribution page.
- Privacy policy and terms.
- Optional screening section, with crisis contacts.

Test runner requirements:

- One question per screen on mobile, grouped questions on desktop.
- Visible progress and an estimate of questions left.
- Back and forward navigation.
- Resume of an unfinished test from `localStorage`.
- Keyboard operation for every control.
- Reduced-motion support.
- No answer is preselected.

Result page requirements:

- Domain scores first, then facet detail.
- A bar or radar chart built with shadcn chart components.
- The norm reference shown next to the numbers.
- A share link that encodes the answers.
- A retake action.

### Result saving without login

Saving works in three layers.
All three layers run in the browser.
No layer needs an account.

Layer 1, automatic local save.

- Every answer writes to `localStorage`, keyed by instrument.
- A finished result is appended to a local history list.
- The history list gives resume, retake, and a result list on the home page.
- Scope: one browser on one device.
- Limit: clearing the browser data removes the history.

Layer 2, share link.

- The result is encoded into the URL fragment, for example `#r=<payload>`.
- The fragment is not sent to the server, so Cloudflare logs never see it.
- The payload packs 120 answers at 3 bits each, which is about 45 bytes and about 60 base64 characters.
- A share link is therefore short enough for chat and social media.
- The link is the private key. Anyone with the link can read the result.
- The result page offers a "scores only" link that hides the raw answers.

Layer 3, export and import.

- A "Download result" action writes a small JSON file.
- An "Import result" action reads that file back.
- This moves a result between devices and keeps a result after the browser data is cleared.
- A printable or PDF layout can reuse the same result view later.

What this design does not provide:

- No cross-device sync.
- No server-side copy.
- No recovery if the browser data is cleared and no export or link was kept.

Optional later layer, only if the site needs short links or cross-device results.
This layer stores scores only, never raw answers.
It gives each result a random identifier.
The record expires after a fixed period.
It needs a Worker route and a store.
Two Cloudflare options exist.
Workers KV allows only 1,000 writes per day on the free plan, so it is not a good fit.
D1 has a much higher write allowance on the free plan, so it is the better fit.
This layer changes the privacy promise, so the result page must state it before an opt-in save.

## 10. Privacy, Ethics, and Legal

Privacy:

- No account and no login.
- Answers stay in the browser.
- `localStorage` holds the current test state and a local result history.
- The share link carries the result in the URL fragment, which the server never receives.
- No answer is sent to a server.
- A plain privacy page states all of the above.

Ethics:

- State clearly that the tests are for education and self-reflection.
- State clearly that the tests are not a diagnosis.
- State clearly that the tests use self-report and that results can change.
- Provide crisis contacts on any mental-health screen, including local Malaysian lines.
- Do not rank users against each other.

Legal and attribution:

- Attribute IPIP and the named authors on every instrument page.
- Keep the public-domain status note with the item data.
- Keep a licenses page that records the source and status of every instrument.

## 11. Search and Languages

Search:

- One static page per instrument with a descriptive title and description.
- Structured data for each test page.
- A sitemap and a robots file.
- Fast static HTML with no blocking JavaScript.

Languages:

- English in the first release.
- Bahasa Melayu in a later release.
- Locale-keyed item text makes the addition data-only.

## 12. Testing and Verification

- Unit tests for scoring, reverse keying, z-scores, percentiles, and bands.
- A build-time check for item counts, facet counts, and duplicate identifiers.
- A data test that recomputes each facet from its declared items.
- Component tests for the test runner and the result view.
- End-to-end tests that complete a full test and assert the result.
- A check against the published IPIP-NEO-120 key on a fixed answer set.
- Lighthouse checks for performance, accessibility, and best practices.
- A browser check of the live deployment in light and dark mode.

## 13. Phases

Each phase ends in a state that can be checked.

Phase 0, foundation.
Initialize the repository, the Astro project, TypeScript, Tailwind, shadcn, linters, and tests.
Check: build, lint, and test all pass.

Phase 1, data and scoring.
Define the types and schema, add the IPIP-NEO-120 items and key, add the norm table, and write the scoring functions with tests.
Check: scoring matches the published key, and all data checks pass.

Phase 2, shell and content pages.
Build the layout, the instrument landing page, and the shared components from shadcn.
Check: pages render, pass accessibility checks, and look correct in light and dark mode.

Phase 3, test runner.
Build the question flow, progress, resume, and keyboard support.
Check: a full test run completes end to end.

Phase 4, results.
Build the result view, the norm reference, the band text, and the share link.
Check: a known answer set produces the expected published scores.

Phase 5, quick test and content.
Add the IPIP Big Five Factor Markers 50, the methodology page, and the licenses page.
Check: both instruments pass all data and scoring tests.

Phase 6, deploy.
Add the Wrangler configuration, deploy to the Worker, bind `test.farissaifuddin.com`, and enable privacy-respecting analytics.
Check: the live URL serves the site, passes Lighthouse, and serves no errors.

Phase 7, outreach and iteration.
Add Bahasa Melayu, more instruments, and saved result history.

## 14. Open Decisions

1. Subdomain name, for example `test.farissaifuddin.com` or `quiz.farissaifuddin.com`.
2. Framework confirmation: Astro with React islands, or Vite plus React Router.
3. Language scope for the first release.
4. Whether the first release includes the PHQ-9 and GAD-7 screening section.
5. shadcn preset and visual style.

## 15. Risks

- Framework risk: shadcn on Astro is supported but less common than on Next.js.
  Mitigation: prove it in Phase 0 and fall back to Vite plus React Router.
- Norm risk: a wrong or misapplied norm table gives misleading percentiles.
  Mitigation: bundle published statistics only, cite the sample, and test the math.
- Legal risk: an instrument may look open but may not be.
  Mitigation: keep the license table and require a check before each addition.
- Perception risk: users may treat a screening score as a diagnosis.
  Mitigation: clear disclaimers and crisis contacts on every result.
- Trust risk: a public test site invites scrutiny of its methods.
  Mitigation: publish the items, the key, the norms, and the citations.
