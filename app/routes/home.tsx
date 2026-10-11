import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { categories } from "~/lib/categories";
import { instruments } from "~/lib/instruments/registry";

export const meta = () => [
  { title: "Free psychological tests" },
  {
    content:
      "Free, open psychological tests scored in your browser. No account, and no answer leaves your device.",
    name: "description",
  },
];

const plannedCategories = categories.filter(
  (category) =>
    !instruments.some((instrument) => instrument.category === category.id)
);

const Home = () => (
  <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 p-4 py-10">
    <header className="flex flex-col gap-3">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        Free psychological tests
      </h1>
      <p className="text-muted-foreground max-w-prose text-pretty">
        Open item sets, scored in your browser. No account, and no answer leaves
        your device.
      </p>
    </header>

    {categories.map((category) => {
      const own = instruments.filter(
        (instrument) => instrument.category === category.id
      );

      if (own.length === 0) {
        return null;
      }

      return (
        <section className="flex flex-col gap-4" key={category.id}>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {category.name}
            </h2>
            <p className="text-muted-foreground max-w-prose text-sm">
              {category.description}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {own.map((instrument) => (
              <Card key={instrument.slug}>
                <CardHeader>
                  <CardTitle>{instrument.title}</CardTitle>
                  <CardDescription>{instrument.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-wrap gap-2">
                    <li>
                      <Badge variant="secondary">
                        {instrument.items.length} items
                      </Badge>
                    </li>
                    <li>
                      <Badge variant="secondary">
                        {instrument.info.durationMinutes.min} to{" "}
                        {instrument.info.durationMinutes.max} minutes
                      </Badge>
                    </li>
                    <li>
                      <Badge variant="outline">{instrument.license}</Badge>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link
                    className={buttonVariants({ className: "self-start" })}
                    to={`/tests/${instrument.slug}`}
                  >
                    View this test
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      );
    })}

    {plannedCategories.length > 0 ? (
      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Planned categories
        </h2>
        <p className="text-muted-foreground max-w-prose text-sm">
          A category appears here only after its instruments pass the licence
          check.
        </p>
        <ul className="flex flex-wrap gap-2">
          {plannedCategories.map((category) => (
            <li key={category.id}>
              <Badge variant="outline">{category.name}</Badge>
            </li>
          ))}
        </ul>
      </section>
    ) : null}
  </main>
);

export default Home;
