import { Link, useNavigate, useParams } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { findInstrument } from "~/lib/instruments/registry";
import type { Instrument } from "~/lib/instruments/schema";
import {
  buildReport,
  describeDomain,
  describePosition,
} from "~/lib/scoring/report";
import { isComplete } from "~/lib/scoring/score";
import { useTestSession } from "~/lib/use-test-session";

export const meta = () => [{ title: "Your result" }];

const NotFound = () => (
  <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 p-4 py-16">
    <h1 className="font-heading text-2xl font-semibold">Test not found</h1>
    <Link className={buttonVariants()} to="/">
      See all tests
    </Link>
  </main>
);

const Result = ({ instrument }: { instrument: Instrument }) => {
  const navigate = useNavigate();
  const session = useTestSession(instrument);

  if (!isComplete(instrument, session.answers)) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 p-4 py-16">
        <h1 className="font-heading text-2xl font-semibold">
          This test is not finished
        </h1>
        <p className="text-muted-foreground">
          Answer every item before you see a result.
        </p>
        <Link
          className={buttonVariants()}
          to={`/tests/${instrument.slug}/start`}
        >
          Continue the test
        </Link>
      </main>
    );
  }

  const report = buildReport(instrument, session.answers);

  const restart = () => {
    session.reset();
    navigate(`/tests/${instrument.slug}/start`);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 py-10">
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">{instrument.title}</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Your result
        </h1>
        <p className="max-w-prose text-pretty">
          Each score is the sum of its items, where a reverse-keyed answer is
          mirrored. Each score is described against the scale itself.
        </p>
      </header>

      <Alert>
        <AlertTitle>No population comparison</AlertTitle>
        <AlertDescription>{instrument.reporting.note}</AlertDescription>
      </Alert>

      <section className="flex flex-col gap-4">
        {report.domains.map(({ domain, facets, position, score }) => (
          <Card key={domain.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>{domain.name}</CardTitle>
                <Badge variant="secondary">{`${score.raw} of ${score.max}`}</Badge>
              </div>
              <CardDescription>
                {describeDomain(domain, position)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                aria-label={`${domain.name} score`}
                max={score.max - score.min}
                value={score.raw - score.min}
              />
              <p className="text-muted-foreground mt-2 text-xs">
                {`${describePosition(position)}. Range ${score.min} to ${score.max}.`}
              </p>
            </CardContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facet</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facets.map(
                    ({ facet, position: facetPosition, score: facetScore }) => (
                      <TableRow key={facet.id}>
                        <TableCell>{facet.name}</TableCell>
                        <TableCell className="text-right">
                          {`${facetScore.raw} of ${facetScore.max}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-muted-foreground">
                            {describePosition(facetPosition)}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button onClick={restart} type="button" variant="outline">
          Take the test again
        </Button>
        <Link className={buttonVariants({ variant: "ghost" })} to="/">
          See all tests
        </Link>
      </div>
    </main>
  );
};

const ResultRoute = () => {
  const { slug } = useParams();
  const instrument = slug ? findInstrument(slug) : undefined;

  if (!instrument) {
    return <NotFound />;
  }

  return <Result instrument={instrument} />;
};

export default ResultRoute;
