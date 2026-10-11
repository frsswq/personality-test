import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import { ResultActions } from "~/components/result-actions";
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
import { findCategory } from "~/lib/categories";
import { addHistory } from "~/lib/history";
import { findInstrument } from "~/lib/instruments/registry";
import type { Instrument } from "~/lib/instruments/schema";
import {
  buildReport,
  bandOf,
  buildReportFromDomainScores,
  buildReportFromFacetScores,
  describeDomain,
  describePosition,
} from "~/lib/scoring/report";
import type { InstrumentReport } from "~/lib/scoring/report";
import { isComplete } from "~/lib/scoring/score";
import {
  answersFromShare,
  answersShare,
  decodeShare,
  domainScoresFromShare,
  encodeShare,
  facetScoresFromShare,
  readShareCode,
  shareFor,
} from "~/lib/share";
import { useTestSession } from "~/lib/use-test-session";

export const meta = () => [{ title: "Your result" }];

interface SharedResult {
  code: string;
  report: InstrumentReport;
  source: "answers" | "scores";
}

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
  const location = useLocation();
  const session = useTestSession(instrument);
  const code = readShareCode(location.hash);
  const category = findCategory(instrument.category);

  const shared = useMemo((): SharedResult | null => {
    if (!code) {
      return null;
    }

    const payload = decodeShare(code, instrument);

    if (!payload || payload.instrumentId !== instrument.id) {
      return null;
    }

    if (payload.mode === "answers") {
      const answers = answersFromShare(payload, instrument);

      return answers
        ? { code, report: buildReport(instrument, answers), source: "answers" }
        : null;
    }

    const facetScores = facetScoresFromShare(payload, instrument);

    if (facetScores) {
      return {
        code,
        report: buildReportFromFacetScores(instrument, facetScores),
        source: "scores",
      };
    }

    const domainScores = domainScoresFromShare(payload, instrument);

    return domainScores
      ? {
          code,
          report: buildReportFromDomainScores(instrument, domainScores),
          source: "scores",
        }
      : null;
  }, [code, instrument]);

  const localReport = useMemo(
    () =>
      isComplete(instrument, session.answers)
        ? buildReport(instrument, session.answers)
        : null,
    [instrument, session.answers]
  );

  const report = shared?.report ?? localReport;

  const codes = useMemo((): {
    answers: string | null;
    scores: string;
  } | null => {
    if (!report) {
      return null;
    }

    let answersCode: string | null = null;

    if (shared) {
      if (shared.source === "answers") {
        answersCode = shared.code;
      }
    } else {
      answersCode = encodeShare(
        instrument,
        answersShare(instrument, session.answers)
      );
    }

    return {
      answers: answersCode,
      scores: encodeShare(instrument, shareFor(instrument, report)),
    };
  }, [report, shared, instrument, session.answers]);

  useEffect(() => {
    if (shared || !(codes?.answers && localReport)) {
      return;
    }

    addHistory({
      code: codes.answers,
      completedAt: new Date().toISOString(),
      slug: instrument.slug,
      title: instrument.title,
    });
  }, [shared, codes, localReport, instrument.slug, instrument.title]);

  if (!report) {
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

      {shared ? (
        <Alert>
          <AlertTitle>Shared result</AlertTitle>
          <AlertDescription>
            {shared.source === "answers"
              ? "This result arrived through a link that carries the answers."
              : "This result arrived through a link that carries the scores only."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Alert>
        <AlertTitle>No population comparison</AlertTitle>
        <AlertDescription>{instrument.reporting.note}</AlertDescription>
      </Alert>

      {category?.notice ? (
        <Alert variant="destructive">
          <AlertTitle>If you need help now</AlertTitle>
          <AlertDescription>{category.notice}</AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-4">
        {report.domains.map(({ domain, facets, position, score }) => {
          const band = bandOf(domain.bands, score.raw);

          return (
            <Card key={domain.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>{domain.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    {band ? (
                      <Badge variant="outline">{band.label}</Badge>
                    ) : null}
                    <Badge variant="secondary">{`${score.raw} of ${score.max}`}</Badge>
                  </div>
                </div>
                <CardDescription>
                  {band?.description ?? describeDomain(domain, position)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  aria-label={`${domain.name} score`}
                  max={score.max - score.min}
                  value={score.raw - score.min}
                />
                <p className="text-muted-foreground mt-2 text-xs">
                  {band
                    ? `Screening range ${score.min} to ${score.max}. A score in this range is not a diagnosis.`
                    : `${describePosition(position)}. Range ${score.min} to ${score.max}.`}
                </p>
              </CardContent>
              {facets.length > 0 ? (
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
                        ({
                          facet,
                          position: facetPosition,
                          score: facetScore,
                        }) => (
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
              ) : null}
            </Card>
          );
        })}
      </section>

      {codes ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Keep or share this result
          </h2>
          <p className="text-muted-foreground max-w-prose text-sm">
            The link carries the result in the part of the address after the
            hash symbol, which a browser never sends to a server.
          </p>
          <ResultActions
            answersCode={codes.answers}
            instrument={instrument}
            scoresCode={codes.scores}
          />
        </section>
      ) : null}

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
