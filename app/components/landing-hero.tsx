import { cn } from "cn";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

// These raw scores illustrate a report. They are not a visitor's results.
const exampleScores = [
  { name: "Extraversion", score: 32 },
  { name: "Agreeableness", score: 41 },
  { name: "Conscientiousness", score: 38 },
  { name: "Emotional stability", score: 35 },
  { name: "Intellect & imagination", score: 43 },
];

const WindowChrome = ({ filename }: { filename: string }) => (
  <div aria-hidden="true" className="home-window-chrome">
    <span className="home-window-dots">
      <i />
      <i />
      <i />
    </span>
    <span>{filename}</span>
  </div>
);

export const LandingHero = () => (
  <section aria-labelledby="landing-title" className="home-hero">
    <div className="home-hero-inner">
      <header className="home-hero-copy">
        <p className="home-eyebrow">A small space for self-discovery</p>
        <h1 id="landing-title">
          Meet yourself.
          <br />
          <span>Again.</span>
        </h1>
        <p className="home-hero-description">
          You&apos;re a work in progress. Get to know your patterns with free,
          open psychological tests.
        </p>
        <a
          className={cn(
            buttonVariants(),
            "home-hero-action h-12 gap-5 rounded-full px-6 has-data-[icon=inline-end]:pr-6"
          )}
          href="#explore"
        >
          Let&apos;s explore
          <ArrowUpRight data-icon="inline-end" />
        </a>
        <p className="home-hero-note">
          No account. Just you and a little curiosity.
        </p>
      </header>

      <section
        aria-labelledby="sample-report-title"
        className="home-report home-preview-position home-preview"
      >
        <Card>
          <WindowChrome filename="your-personality.report" />
          <CardHeader>
            <p className="home-eyebrow">Sample report</p>
            <CardTitle>
              <h2 id="sample-report-title">More than a label.</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="home-traits">
              {exampleScores.map(({ name, score }) => (
                <li key={name}>
                  <div className="home-trait-label">
                    <span>{name}</span>
                    <span>{score} / 50</span>
                  </div>
                  <Progress
                    aria-label={`${name}, illustrative score`}
                    aria-valuetext={`${score} out of 50`}
                    max={50}
                    min={10}
                    value={score}
                  />
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <p>Illustrative raw scores · out of 50</p>
          </CardFooter>
        </Card>
      </section>

      <section
        aria-labelledby="sample-question-title"
        className="home-question home-preview-position home-preview"
      >
        <Card>
          <WindowChrome filename="a-moment-for-you.test" />
          <CardHeader>
            <p className="home-eyebrow">Sample question · 01 / 50</p>
            <CardTitle>
              <h2 id="sample-question-title">I am the life of the party.</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol
              aria-label="Example answer: 4, accurate"
              className="home-answers"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <li key={value}>
                  <Badge variant={value === 4 ? "default" : "outline"}>
                    {value}
                  </Badge>
                </li>
              ))}
            </ol>
            <div className="home-answer-labels">
              <span>Very inaccurate</span>
              <span>Very accurate</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        aria-label="Privacy reminder"
        className="home-privacy home-preview-position home-preview"
      >
        <Card>
          <WindowChrome filename="just-so-you-know.txt" />
          <CardHeader>
            <CardTitle>
              <p>Your answers. Yours.</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Everything is scored right here in your browser.</p>
          </CardContent>
        </Card>
      </section>

      <section
        aria-label="Curiosity reminder"
        className="home-reminder home-preview-position"
      >
        <Card>
          <CardHeader>
            <p>A gentle reminder</p>
            <CardTitle>
              <p>Curiosity. Not a verdict.</p>
            </CardTitle>
          </CardHeader>
        </Card>
      </section>
    </div>
  </section>
);
