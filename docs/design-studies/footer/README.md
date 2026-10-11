# Footer closing studies

These four closes were the review of the footer for the lavender landing page.
The production footer is variant 4, the dotted glow.

## The card

Every variant shares one card above the closing graphic.
The card holds the brand, a privacy promise, the copyright line, and two link columns.
The links are the only route to Methodology, Licences, and Privacy, because the header no longer carries them.
The production card ends the left column with `© 2026`, and it carries no other fine print.

## The variants

| Variant | Direction        | Desktop                              | Mobile                                     |
| ------- | ---------------- | ------------------------------------ | ------------------------------------------ |
| 1       | The wide horizon | [Desktop](screenshots/variant-1.png) | [Mobile](screenshots/variant-1-mobile.png) |
| 2       | The ripple       | [Desktop](screenshots/variant-2.png) | [Mobile](screenshots/variant-2-mobile.png) |
| 3       | The corner mark  | [Desktop](screenshots/variant-3.png) | [Mobile](screenshots/variant-3-mobile.png) |
| 4       | The dotted glow  | [Desktop](screenshots/variant-4.png) | [Mobile](screenshots/variant-4-mobile.png) |

Variant 1 flattens the filled arcs of the earlier review, so the shape reads as a horizon.
Variant 2 draws the same nesting as outlines, which echoes the two nested curves of the logo.
Variant 3 drops the arcs and sets the logo mark large and pale in the closing corner.
Variant 4 repeats the hero dot grid, adds a lavender glow, and crops one thin purple dome at the bottom edge.

## The chosen variant

Variant 4 is implemented in `app/components/site-footer.tsx` with the `site-footer-*` utilities in `app/app.css`.
The dot grid and the glow fade in through a mask, so the panel has no hard seam above it.
The dome is a single bordered circle, 1400 pixels wide, cropped by the bottom edge.

## References

The closing shape follows `visitors.now`, which ends its page with nested arcs that bleed off the bottom edge.
The labelled link columns follow Apple and ElevenLabs.
The dot texture is the one already used by the hero.

## How the screenshots were made

Each variant replaced the footer markup on a local production build through Playwright.
The page therefore shows the real fonts, the real colours, and the surrounding sections.
The captures used widths of 1440 and 390 pixels, and none of them overflowed.
