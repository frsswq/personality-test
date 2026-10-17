-- Owner-only queries over active saved results, not verified people or attempts.
-- Raw score groups are self-reported and are not population norms.
-- These queries read all matching result rows. Monitor D1 usage before running.

SELECT instrument_id, COUNT(*) AS saved_results
FROM results
WHERE expires_at > unixepoch('now')
GROUP BY instrument_id
ORDER BY instrument_id;

SELECT results.instrument_id, results.scale_kind, score.key AS scale_id,
       CAST(score.value AS INTEGER) AS raw_score, COUNT(*) AS saved_results
FROM results, json_each(results.scores) AS score
WHERE results.expires_at > unixepoch('now')
GROUP BY results.instrument_id, results.scale_kind, score.key, score.value
ORDER BY results.instrument_id, score.key, raw_score;
