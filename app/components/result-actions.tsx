import { DownloadIcon, LinkIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import type { Instrument } from "~/lib/instruments/schema";
import { buildResultFile, resultFileName } from "~/lib/result-file";
import { shareUrlFor } from "~/lib/share";

interface ResultActionsProps {
  /** Present when the full answer set is available. */
  answersCode: string | null;
  instrument: Instrument;
  scoresCode: string;
}

const saveFile = (instrument: Instrument, code: string) => {
  const file = buildResultFile({
    code,
    instrumentId: instrument.id,
    slug: instrument.slug,
  });
  const blob = new Blob([`${JSON.stringify(file, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.download = resultFileName(instrument.slug);
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const ResultActions = ({
  answersCode,
  instrument,
  scoresCode,
}: ResultActionsProps) => {
  const [message, setMessage] = useState("");
  const exportCode = answersCode ?? scoresCode;

  const copyLink = async (code: string, label: string) => {
    try {
      await navigator.clipboard.writeText(shareUrlFor(instrument.slug, code));
      setMessage(label);
    } catch {
      setMessage(
        "The browser blocked the clipboard. Copy the address by hand."
      );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {answersCode ? (
          <Button
            onClick={() => copyLink(answersCode, "Result link copied.")}
            type="button"
            variant="outline"
          >
            <LinkIcon data-icon="inline-start" />
            Copy result link
          </Button>
        ) : null}
        <Button
          onClick={() => copyLink(scoresCode, "Scores-only link copied.")}
          type="button"
          variant="outline"
        >
          <LinkIcon data-icon="inline-start" />
          Copy scores-only link
        </Button>
        <Button
          onClick={() => saveFile(instrument, exportCode)}
          type="button"
          variant="outline"
        >
          <DownloadIcon data-icon="inline-start" />
          Download result file
        </Button>
      </div>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {message}
      </p>
    </div>
  );
};
