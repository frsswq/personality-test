# Assessment Site References

Status: active.
Owner: Faris Saifuddin.

These sites are product references for similar assessment websites.
Use them to study test discovery, test-taking flow, and result presentation.
[DESIGN.md](DESIGN.md) still sets our visual direction.
These references do not change our light-mode, privacy, or instrument-licence rules.

## Open Source Psychometrics Project

Website: <https://openpsychometrics.org/>.

Study its test catalogue, descriptions of assessment models, and discussion of strengths, weaknesses, and validity.
Its home page identifies public-domain IPIP scales as the source for its Big Five test.
The catalogue includes both scientific instruments and entertainment quizzes.
A listing on this site is not proof that an instrument meets our licence or evidence requirements.

## Big Five Test

Website: <https://bigfive-test.com/>.
Source repository: <https://github.com/rubynor/bigfive-web>.

Study its clear start action, stated question count and completion time, and test progress display.
Its home page describes a 120-question test that takes about 10 minutes and needs no registration.
The runner shows an elapsed timer, percentage progress, and five labelled response options.
The result lookup page accepts a saved result ID.
That lookup is a reference pattern, not a change to our local result-storage design.

The repository separates questions, scoring, and results into packages.
Its README identifies IPIP as the source for tests and evaluation.
The repository carries an MIT licence.
Check the licence and attribution requirements of any code or content before reuse.

## 16Personalities

Website: <https://www.16personalities.com/>.

Study its clear test entry point, short sections, visual identity, and navigation between the test and personality descriptions.
Its home page uses prominent participation metrics and illustrations to explain the product.
Treat those metrics and claims as the site's own statements, not evidence for our instruments.

Use this site as a UX and visual reference only.
Do not copy its questions, reports, artwork, branding, or named types.
The exclusion of MBTI and 16Personalities in [PLAN.md section 4](PLAN.md#4-instrument-sourcing-and-licensing) remains in effect.

## Use and limits

Review these references before changing the assessment flow.
Keep our instrument pages clear about item count, expected time, source, and evidence.
Keep progress visible in the runner.
Put scores before detail and caveats in the result report.

The live home pages, selected test entry pages, and Big Five repository README and licence were inspected when this set was added.
No full assessment or result-report audit was completed.
Recheck the relevant flow before using it to guide an implementation.
