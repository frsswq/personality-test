import { Link, NavLink } from "react-router";

const links = [
  { href: "/", label: "Tests" },
  { href: "/methodology", label: "Methodology" },
  { href: "/licenses", label: "Licences" },
  { href: "/privacy", label: "Privacy" },
];

export const SiteHeader = () => (
  <header className="border-b">
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 p-4">
      <Link
        className="font-heading text-base font-semibold tracking-tight"
        to="/"
      >
        personality-test
      </Link>
      <nav aria-label="Main" className="flex items-center gap-1">
        <ul className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "text-foreground rounded-md px-2 py-1 text-sm font-medium"
                    : "text-muted-foreground hover:text-foreground rounded-md px-2 py-1 text-sm font-medium"
                }
                end
                to={link.href}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </header>
);
