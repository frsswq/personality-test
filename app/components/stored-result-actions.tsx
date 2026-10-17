import { LinkIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { storedUrlFor } from "~/lib/remote-result";
import type { StoredUploadState } from "~/lib/use-stored-result";

interface StoredResultActionsProps {
  onDelete: () => Promise<boolean>;
  onRetry?: () => Promise<void>;
  slug: string;
  state: StoredUploadState;
}
export const StoredResultActions = ({
  onDelete,
  onRetry,
  slug,
  state,
}: StoredResultActionsProps) => {
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(storedUrlFor(slug, id));
      setMessage("Stored link copied.");
    } catch {
      setMessage("The browser blocked the clipboard. Use the link below.");
    }
  };
  const remove = async () => {
    setDeleting(true);
    const success = await onDelete();
    setDeleting(false);
    if (success) {
      setDeleted(true);
    } else {
      setMessage("The stored copy could not be deleted. Please try again.");
    }
  };
  if (state.kind === "idle") {
    return null;
  }
  if (deleted || state.kind === "deleted") {
    return (
      <output className="text-muted-foreground text-sm">
        The stored copy was deleted. Your local result is unchanged.
      </output>
    );
  }
  if (state.kind === "saving") {
    return (
      <output className="text-muted-foreground text-sm">
        Saving your scores. Your answers stay in this browser.
      </output>
    );
  }
  if (state.kind === "failed") {
    return (
      <div className="flex flex-col gap-2">
        <output className="text-muted-foreground text-sm">
          The stored copy is not available right now. Your local result, links,
          and download still work.
        </output>
        {onRetry ? (
          <Button
            className="self-start"
            onClick={onRetry}
            type="button"
            variant="outline"
          >
            Try saving again
          </Button>
        ) : null}
      </div>
    );
  }
  if (state.kind !== "saved") {
    return null;
  }
  const url = storedUrlFor(slug, state.reference.id);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground max-w-prose text-sm">
        Only your scores are stored, never your answers. This private link works
        on another device until{" "}
        {new Date(state.reference.expiresAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        . Anyone with the link can read or delete the stored copy.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => copyLink(state.reference.id)}
          type="button"
          variant="outline"
        >
          <LinkIcon data-icon="inline-start" />
          Copy stored link
        </Button>
        <Button
          disabled={deleting}
          onClick={remove}
          type="button"
          variant="outline"
        >
          <Trash2Icon data-icon="inline-start" />
          {deleting ? "Deleting stored copy" : "Delete stored copy"}
        </Button>
      </div>
      <a className="text-sm break-all underline underline-offset-4" href={url}>
        {url}
      </a>
      <output className="text-muted-foreground text-sm">{message}</output>
    </div>
  );
};
