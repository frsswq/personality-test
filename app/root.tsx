import { useLayoutEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { SiteFooter } from "~/components/site-footer";
import { SiteHeader } from "~/components/site-header";
import { applyTheme } from "~/lib/theme";
import { useTheme } from "~/lib/use-theme";

import type { Route } from "./+types/root";

import "./app.css";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  // The store hands over `null` during hydration, so the first client render
  // matches the pre-rendered shell. This layout effect then applies the stored
  // choice before the first paint, so a dark-mode visitor never sees a light
  // flash. With no stored choice the stylesheet follows the operating system.
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex min-h-svh flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const App = () => <Outlet />;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : (error.statusText ?? details);
  } else if (import.meta.env.DEV && error instanceof Error) {
    const { message: errorMessage, stack: errorStack } = error;
    details = errorMessage;
    stack = errorStack;
  }

  return (
    <main className="container mx-auto flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">{message}</h1>
      <p className="text-muted-foreground">{details}</p>
      {stack ? (
        <pre className="bg-muted w-full overflow-x-auto rounded-lg p-4 text-left text-xs">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
};

export default App;
