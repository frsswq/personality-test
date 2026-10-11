import { Link } from "react-router";

export const SiteFooter = () => (
  <footer className="border-t">
    <div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p>Free and open tests. No account, and answers stay in your browser.</p>
      <nav aria-label="Footer" className="flex flex-wrap gap-4">
        <Link
          className="hover:text-foreground underline underline-offset-4"
          to="/methodology"
        >
          Methodology
        </Link>
        <Link
          className="hover:text-foreground underline underline-offset-4"
          to="/licenses"
        >
          Licences
        </Link>
        <Link
          className="hover:text-foreground underline underline-offset-4"
          to="/privacy"
        >
          Privacy
        </Link>
      </nav>
    </div>
  </footer>
);
