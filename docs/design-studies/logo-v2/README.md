# Logo study, second pass

Status: review set. No mark is adopted.
Owner: Faris Saifuddin.

This study holds twelve candidate marks for the site.
The site still ships the dot-grid mark in `app/components/site-logo.tsx`.
Nothing in this folder is a production route.

## Why a second pass

The shipped mark is eight dots on a 3 by 3 grid with an empty centre.
The idea is right: no one sits at the average.
The drawing is not.
Eight identical dots read as a pattern block, so the mark shares its shape with loaders, particle icons, and dot-grid app tiles.
It says "pattern", not "measurement".
A mark for this site has to carry a device, and the device has to come from the reference books.

## What the study read

Both references are page scans without a text layer.
They were read as plates, captions, and chapter structure, not as running text.
Reference copies sit outside version control in `reference/logo`, which `.gitignore` covers.

`reference/logo/kuwayama-trademarks-and-symbols-vol2.pdf`:

- Contents, "Trademarks change with the times", and "Design competitions".
- Read in full for geometry: Circles (1) Radial lines, straight lines, curves; Circles (2) Revolution; Circles (3) Revolution, continued; Rectangles; Triangles; Polygons.
- Read in part: human figures, arrows, signs.
- Not read: the remaining subject chapters (animals, birds, fish, insects, flowers, trees, architecture, tools, heavenly bodies, mountains, fire and water, ideographs, syllabaries).

`reference/logo/logo-modernism.pdf` (Jens Müller, Taschen):

- The contents page, both essays, and the essay plates that carry captioned works.
- Sections behind the options: Geometric (Angular 58, Basic Forms 72, Circle 82, Cross 106, Dots 110, Lines 120, Square 142, Triangle 150) and Effect (Cut-off 156, Split 162, Grid 178, Reflection 182, Outline 192, Overlay 204, Positive/Negative 212, Rotation 224, White on Black 242).
- Page numbers are the section starts from the book's contents page.
- Not read: most of the catalogue, and all of the Typographic and Profiles sections.

## The rules

Every option follows the same rules, so the set compares cleanly.

- One grid: 40 by 40 units, centre at 20, 20, with an 8 unit margin.
- One weight: stroke 4 on the grid, with round caps and round joins.
- One colour: the mark inherits `currentColor`, and the stylesheet sets the ink.
- Two values: the mark must hold at 28 pixels, at 16 pixels, and reversed out of a solid field.
- No faces, no heads, no brains, and no medical cross, because the site makes no clinical claim.
- No letters, because the wordmark carries the name.

## The twelve options

| No  | Name       | Device                | Source                                                                |
| --- | ---------- | --------------------- | --------------------------------------------------------------------- |
| 01  | Marker     | Circle and line       | Kuwayama, Circles (1). Logo Modernism, Lines and Dots.                |
| 02  | Off-centre | Positive and negative | Kuwayama, Circles (1). Logo Modernism, Positive/Negative.             |
| 03  | Door       | Cut-off               | Logo Modernism, Cut-off and the Claude Neon case study.               |
| 04  | Mirror     | Reflection            | Logo Modernism, Reflection. Kuwayama, Circles (3).                    |
| 05  | Quarter    | Basic forms           | Logo Modernism, Basic Forms and Split. Kuwayama, Circles (1).         |
| 06  | Profile    | Lines                 | Kuwayama, Rectangles. Logo Modernism, Lines.                          |
| 07  | Rotation   | Revolution            | Kuwayama, Circles (2) and Circles (3). Logo Modernism, Rotation.      |
| 08  | Bracket    | Basic forms           | Logo Modernism, Basic Forms. Kuwayama, Tools (1).                     |
| 09  | Step       | Angular               | Logo Modernism, Angular and Lines. Kuwayama, Signs.                   |
| 10  | Peak       | Lines, curves         | Kuwayama, Circles (1). Logo Modernism, Lines and Mexico 68.           |
| 11  | Lens       | Overlay               | Logo Modernism, Overlay and Positive/Negative. Kuwayama, Circles (3). |
| 12  | Fill       | Positive and negative | Logo Modernism, Positive/Negative, Basic Forms, Square.               |

Each card in `options.html` carries the construction numbers, the reference, and the risk of that option.

## How to inspect the study

Open [options.html](options.html) in a browser.
The page needs no server, because it loads the Geist font from the neighbouring lavender study.
Click a card to place that mark in the header mock and in the browser tab mock.
Press "Show construction grid" to see the guides behind each mark.
The page shows all twelve at 28 pixels, at 16 pixels, and reversed out of the accent.

## How to adopt a mark

1. Pick one mark and record the pick at the top of this file.
2. Replace the paths in `app/components/site-logo.tsx`, and keep the `viewBox="0 0 40 40"` attribute and the `site-logo` class.
3. Rewrite every `mask` and `clipPath` as explicit paths.
   Option 05 uses a clip, and option 11 uses a mask.
   The icon build and the favicon carry plain paths.
4. Replace `public/favicon.svg` with the same geometry in the accent colour.
5. Run `bun run build:icons` to rebuild `favicon.ico` and `apple-touch-icon.png`.
6. Check the mark at 28 pixels in the header, at 16 pixels in the tab, and reversed out of a solid field.
7. Run `bun run check`, `bun run test`, and `bun run typecheck`.

Seven options lose detail at 16 pixels.
Their cards state the loss, and the icon build needs a simplified path for each of them, in the same way the shipped dot mark needed one.
