import { cn } from "cn";
import { ArrowUpRight } from "lucide-react";
import { Link, NavLink } from "react-router";

import { SiteLogo } from "~/components/site-logo";
import { buttonVariants } from "~/components/ui/button";

const links = [{ href: "/#explore", label: "Tests" }];

export const SiteHeader = () => (
  <header className="site-header">
    <div className="site-header-inner">
      <Link className="site-brand" to="/">
        <SiteLogo />
        <span>personality-test</span>
      </Link>
      <nav aria-label="Main" className="flex items-center gap-6">
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <NavLink
                className="text-muted-foreground hover:text-foreground text-sm"
                to={link.href}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link
          className={cn(
            buttonVariants({ size: "sm" }),
            "site-header-action gap-4 rounded-full px-4 has-data-[icon=inline-end]:pr-4"
          )}
          to="/#explore"
        >
          Find your test
          <ArrowUpRight data-icon="inline-end" />
        </Link>
      </nav>
    </div>
  </header>
);
