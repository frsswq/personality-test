import { Link, useParams } from "react-router";

import { buttonVariants } from "~/components/ui/button";
import { findInstrument } from "~/lib/instruments/registry";

export const meta = () => [{ title: "Test runner" }];

/**
 * Placeholder for the runner. Phase 3 replaces this file with the real
 * question flow, the progress bar, and the resume behaviour.
 */
const RunnerRoute = () => {
  const { slug } = useParams();
  const instrument = slug ? findInstrument(slug) : undefined;

  if (!instrument) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 p-4 py-16">
        <h1 className="font-heading text-2xl font-semibold">Test not found</h1>
        <Link className={buttonVariants()} to="/">
          See all tests
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 py-16">
      <h1 className="font-heading text-2xl font-semibold">
        {instrument.title}
      </h1>
      <p className="text-muted-foreground">
        The question flow arrives in the next release of this site.
      </p>
      <Link
        className={buttonVariants({ variant: "outline" })}
        to={`/tests/${instrument.slug}`}
      >
        Back to the test page
      </Link>
    </main>
  );
};

export default RunnerRoute;
