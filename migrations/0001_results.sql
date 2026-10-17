-- One row per completed test result.
--
-- The row holds derived scores only. It holds no answer, no name, no email
-- address, no account, no cookie value, and no IP address.
--
-- `created_day` is a UTC day, not a clock time, so rows cannot be ordered to
-- the second. See docs/D1-RESULTS.md section 5.
CREATE TABLE results (
  id TEXT PRIMARY KEY NOT NULL,
  instrument_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  scale_kind TEXT NOT NULL,
  scores TEXT NOT NULL,
  created_day TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  CHECK (scale_kind IN ('facet', 'domain')),
  CHECK (length(id) = 32),
  CHECK (length(created_day) = 10),
  CHECK (json_valid(scores))
) STRICT, WITHOUT ROWID;

-- Serves the completion count and the score distributions.
CREATE INDEX results_instrument_day ON results (instrument_id, created_day);

-- Serves the daily retention sweep.
CREATE INDEX results_expires_at ON results (expires_at);
