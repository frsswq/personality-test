import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const meta = () => [
  { title: "Free psychological tests" },
  {
    content:
      "Free, open psychological tests scored in your browser. No account, and no answer leaves your device.",
    name: "description",
  },
];

const Home = () => (
  <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-8 p-6">
    <header className="flex flex-col gap-3">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        Free psychological tests
      </h1>
      <p className="text-muted-foreground max-w-prose text-pretty">
        Open item sets, scored in your browser. No account, and no answer leaves
        your device.
      </p>
    </header>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Big Five (IPIP-NEO-120)</CardTitle>
          <Badge variant="secondary">In progress</Badge>
        </div>
        <CardDescription>
          120 items across 5 domains and 30 facets. Public domain, from the
          International Personality Item Pool.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          The test runner and the scoring engine are under construction.
        </p>
      </CardContent>
    </Card>
  </main>
);

export default Home;
