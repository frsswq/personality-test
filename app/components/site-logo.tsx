/**
 * The site mark: eight dots on a 3 by 3 grid, with the centre left empty.
 * The empty centre is the idea, because no one sits at the average.
 *
 * The mark sits on a 40 unit grid, the same grid as the favicon, and it fills
 * with `currentColor`, so the stylesheet owns the colour.
 */
export const SiteLogo = () => (
  <svg
    aria-hidden="true"
    className="site-logo"
    fill="currentColor"
    viewBox="0 0 40 40"
  >
    <circle cx="10" cy="10" r="2.6" />
    <circle cx="20" cy="10" r="2.6" />
    <circle cx="30" cy="10" r="2.6" />
    <circle cx="10" cy="20" r="2.6" />
    <circle cx="30" cy="20" r="2.6" />
    <circle cx="10" cy="30" r="2.6" />
    <circle cx="20" cy="30" r="2.6" />
    <circle cx="30" cy="30" r="2.6" />
  </svg>
);
