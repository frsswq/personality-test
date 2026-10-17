# Lavender landing-page studies

These four layouts preserve the alternatives shown during the landing-page design review.
They are reference files, not production routes.
The selected production direction is the original centered collage in [selected.html](selected.html), not one of these four alternatives.

## Open the studies

Open [layouts.html](layouts.html) in a browser.
It uses the bundled Geist font and needs no server or network access.
Use the arrow buttons or the left and right arrow keys to change layouts.
The `layout` query parameter accepts `1`, `2`, `3`, or `4`.
For example, open `layouts.html?layout=3` to show the featured starting point.

| Layout | Direction                   | Desktop screenshot                  | Mobile screenshot                         |
| ------ | --------------------------- | ----------------------------------- | ----------------------------------------- |
| 1      | The split canvas            | [Desktop](screenshots/layout-1.png) | [Mobile](screenshots/layout-1-mobile.png) |
| 2      | The open workspace          | [Desktop](screenshots/layout-2.png) | [Mobile](screenshots/layout-2-mobile.png) |
| 3      | The featured starting point | [Desktop](screenshots/layout-3.png) | [Mobile](screenshots/layout-3-mobile.png) |
| 4      | The curiosity desk          | [Desktop](screenshots/layout-4.png) | [Mobile](screenshots/layout-4-mobile.png) |

## Selected direction

The landing page uses dusty lavender, a centered headline, and small product windows around the headline on wide screens.
The production mobile view puts the report and question in normal document flow.
It removes decorative rotation and repeated notes on small screens so cards do not overlap or leave the viewport.
The selected HTML retains the earlier mobile collage for comparison with the fix.

The nested P-shaped [logo](logo.svg) represents personal perspective.
The nested P-shaped [logo](logo.svg) represents personal perspective.
Production has since moved to the dot-grid mark in [the logo study](../logo/README.md), because the nested P read as a generic letterform.
It is included in the production header and SVG favicon.
The archived layouts are read-only visual studies, so their test buttons do not start a real instrument.
Do not copy their static sample scores into scoring code.

## Font licence

Geist uses the SIL Open Font License.
The bundled font licence is in [GEIST-LICENSE.txt](GEIST-LICENSE.txt).

## Browser verification

Install the browser once with `bunx playwright install chromium --only-shell`.
Run `bun run test:e2e` from the repository root.
The browser tests build the production assets and check landing-page geometry at 320, 390, 768, 1024, 1280, and 1440 pixels.
They also check the test links, return navigation, and invalid result-file feedback.
Desktop and mobile screenshots are written to the ignored `test-results` directory.
