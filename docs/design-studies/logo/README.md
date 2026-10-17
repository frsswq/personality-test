# Logo studies

## Decision

Option 12, Vacancy, is the adopted mark.
The moved dot was removed in review, so the centre of the 3 by 3 grid is empty.
The adopted colour is plum, `#8A3F6D`, from the ten colourways in the colour study.
The production header, the favicon, the tab icon, and the apple touch icon all carry the mark.
The tinted tokens in `app/app.css` derive from the same plum.

These twelve marks were the review of the site logo.
The shipped mark is the nested P in [logo.svg](../lavender/logo.svg).
It reads as a generic letterform, so this study replaces the word shape with an idea.

## Open the study

Open [options.html](options.html) in a browser.
The page needs no server, because it loads the Geist font from the neighbouring lavender study.
Click a card to place the mark in the header mock and in the browser tab mock.
Press "Show construction grid" to see the guides behind each mark.

## The options

| No  | Name       | Idea                                                                   | Construction                                     |
| --- | ---------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| 01  | Phases     | A disc with an offset void. The self looks different from every angle. | Disc r14, void disc r11 offset 9.2, evenodd      |
| 02  | Bond       | Two discs with the overlap removed. Two traits make one person.        | Discs r11, centres 12 apart, evenodd             |
| 03  | Set        | Three discs on one ring. A result is a set of scores, not a type.      | Discs r6.5 on ring r11, 120 degrees apart        |
| 04  | Seam       | Two half discs offset on a diameter. Two selves inside one circle.     | Half discs r12, offset 8, seam of 3              |
| 05  | Coil       | Two arcs turn inward. Depth below the surface answer.                  | Arc r12 and arc r6, one tangent point            |
| 06  | Void       | A square with a round void. The part of a person that stays inside.    | Square of 28 with a circular void r9, evenodd    |
| 07  | Link       | Two interlocked rings. The self, and the other people it meets.        | Rings r9, centres 11 apart, one break each       |
| 08  | Block P    | The name drawn as geometry. One bar, one half disc, one counter.       | Bar 6 by 28, bowl r10, counter r4, evenodd       |
| 09  | Triform    | Three bars at 60 degrees. Symmetry with air left in the middle.        | Bars r14, 60 degrees apart                       |
| 10  | Steps      | Three rising levels. Traits are measured on a scale, not typed.        | Steps of 8 units on a square grid                |
| 11  | Split ring | One ring drawn in two arcs. The self and the self you show.            | Two 140 degree arcs, r13, rotated 180            |
| 12  | Vacancy    | A dot grid with one place empty. No one sits at the average.           | Eight dots r2.6 at 10 unit spacing, centre empty |

## The rules

Every mark follows the same rules, so the set compares cleanly.

- One grid: 40 by 40 units, with the centre at 20,20 and an 8 unit margin.
- One weight: stroke width 4 on the grid, with round caps and round joins.
- One colour: the mark inherits `currentColor`, and the stylesheet sets `--primary`.
- Two values: the mark must hold at 28 pixels, at 16 pixels, and reversed out of a solid field.
- No letters, with one exception: option 08 keeps the initial P, because the geometry carries it.

## Colour options

[colors.html](colors.html) holds ten inks for the mark, and it uses option 12 as the subject.
The site runs one accent colour, so a colour choice sets `--primary` and every token that follows from it.
Each card in that study derives the mark tint, the border, the page wash, and the button fill from the same value.
Contrast against the page runs from 3.7 to 1 for ochre, which needs a darker mix, to 13 to 1 for graphite.
The shipped accent is dusty lavender, `#7960A0`, at 5.0 to 1.

## References

## References

- Yasaburo Kuwayama, Trademarks and Symbols, volumes 1 and 2.
  These volumes supply the construction method and the families of arcs, rings, counterforms, and rotational symmetry.
- Jens Muller, Logo Modernism.
  This book supplies the mid-century reduction to circles, bars, and negative space.
- The site reference set in [DESIGN.md](../../DESIGN.md).
  The mark must sit inside the existing type and spacing rules.

## How to adopt a mark

1. Replace the paths in `app/components/site-logo.tsx` and keep the `viewBox="0 0 40 40"` and the `site-logo` class.
2. Replace `public/favicon.svg` with the same geometry in `#7960a0`.
3. Run `bun run build:icons` to rebuild `favicon.ico` and `apple-touch-icon.png`.
4. Check the header at 28 pixels, the tab at 16 pixels, and the reversed mark on a solid field.
5. Run `bun run check`, `bun run test`, and `bun run typecheck`.

A 16 pixel tab icon loses inner detail.
The current build handles that with a simplified path in `scripts/build-icons.ts`.
Keep that step for any mark whose inner shape closes up at 16 pixels.
