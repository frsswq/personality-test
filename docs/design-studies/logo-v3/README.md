# Logo study 03

Status: review candidates, not adopted.

## Brief

Create twelve distinct logo candidates for a free psychological testing site.
Replace the previous study's isolated primitives with designed silhouettes, internal contours, and negative space.
Keep the existing plum accent.
Do not rename the site or change its production logo.
The Indonesian labels identify design concepts, not approved brand names.

## Files

- `options.html` is a self-contained comparison sheet.
  Open it directly without a server.
- `marks/` contains twelve independent SVG files.
- `marks.json` records the paths, concept, source reference, and caveat for each mark.

The sheet shows each drawing large, at 24 pixels, at 16 pixels, and reversed.
Each reference disclosure opens with a pointer or keyboard.
All SVGs use explicit paths and `currentColor`.
They do not depend on remote resources, masks, clips, or shared SVG IDs.

## Design decisions

A logo needs a recognizable silhouette before it needs an explanation.
The first two studies relied too much on basic shapes and explanations.
This pass uses three competing approaches: human counterforms, organic curved forms, and constructed bands.
It removes the previous study's arbitrary prohibition on faces and letter-like forms.
A face does not itself make a clinical claim.
A strict shared construction grid is not a substitute for optical balance.
Each drawing has its own proportions inside a 100-unit viewBox.

The recommended shortlist is 01 Temu, 03 Lapisan, and 06 Belah.
Temu is the most human direction.
Lapisan is the most graphic contour direction.
Belah is the most compact organic direction.
These recommendations are design judgments, not measured preference results.

## Reference evidence

The supplied PDFs remain in the ignored `reference/logo/` directory.
The drawings are new vector constructions, not tracings of book marks.
The following spreads were visually inspected for this pass:

- Kuwayama, volume 2, PDF page 13, printed pages 20-21: faces built with contours and counterforms.
- Kuwayama, volume 2, PDF page 57, printed pages 108-109: interrupted loops, interwoven bands, and nested circular constructions.
- Logo Modernism, PDF page 42, printed pages 84-85: positive and negative circular forms, internal channels, and directional curved bands.

The page labels refer to the supplied scans, not another PDF edition.
This is a focused reference study.
It does not claim a complete reading of either book.
A reference identifies a construction family, not an assertion that a specific historical mark has the same meaning as this site's proposal.

## Review and verification

The drawings were reviewed together before delivery.
The tangled first interlace and the duplicate cube direction were replaced.
The final sheet was previewed at 728 and 390 pixels.
The 390-pixel preview checked all twelve reference disclosures opening and closing, horizontal overflow, and geometry bounds.
The large, small, and reversed drawings were inspected visually.
No production build, E2E suite, or application browser test was run.

Small-size previews are review evidence, not a claim that every mark is favicon-ready.
Lapisan and Inti have narrow internal details that need particular care before adoption.
No trademark, similarity clearance, or user recognition study has been performed.
The drawings must not be described as legally unique.

## Adoption boundary

Do not replace `app/components/site-logo.tsx` or `public/favicon.svg` until the user selects a direction.
Refine the selected drawing, check its distinctiveness, and create final favicon geometry as a separate change.
Do not change Cloudflare resource names or the local result-history key as part of a visual identity change.
