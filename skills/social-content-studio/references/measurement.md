# Measurement and learning from own data

Load when the user provides metrics, asks what to repeat or wants to improve future pieces. A single post only needs its hypothesis and its metric in the contract.

## Minimum input

One row per post, exported from the network's analytics tool or entered by hand:

| Field | Note |
| --- | --- |
| Date, topic, format | Compare only pieces with the same goal and format |
| Hook (first 3 seconds or first line) | The most common variable to analyze |
| Duration (video) | And average retention if available |
| Reach and % non-followers | Base of all ratios |
| Saves, shares, comments | Always as a rate over reach |
| Followers gained, qualified messages or contacts | Closest to the commercial goal |
| Paid or organic | Analyze separately |

If a column needed for a calculation is missing, ask for it before calculating. Do not fill in invented values.

## Analysis

1. Normalize by reach. Compare rates, never raw numbers
2. Sort by the goal's metric: to win clients, saves, shares, comments with intent and contacts weigh most. Views go last
3. For the top three pieces, isolate one cause (hook, topic or format). If it cannot be isolated, write that down
4. Describe the common pattern of the worst ones, without softening it
5. What to repeat and what to drop, at most three on each side, by expected impact
6. Three new ideas that come from the own data, each with the concrete piece that backs it
7. For each idea, a complete spoken script and several hooks with different mechanisms (see [voice and hooks](voice-and-hooks.md)). No five variations of the same sentence
8. With few observations, mark the pattern as a hypothesis. A sample of one or two cases does not prove causality

Each claim carries the number that supports it. Quote verbatim when talking about a comment. If a section lacks enough data, write that.

## Diagnosing a video drop-off

Work down the funnel and fix the first weak stage. These cut-offs are starting heuristics from marketing sources; compare them with the account's own history before trusting them.

| Stage | Weak sign | Fix |
|---|---|---|
| 3-second hold | below about 30% | The visual hook and the on-screen text hook |
| Hold at 15 s | below about 20% | The bridge from seconds 3 to 15 |
| Good retention, low click-through (below about 1%) | | The payoff, the offer and the CTA |
| Good click-through, low conversion | | Match between the video's promise and the landing page |

## Test one variable

A test changes a single identifiable thing (opening scene, question, demonstration, format) over equivalent windows. Record hypothesis, metric, period, denominator, sample size and review date. When several things change at once, no causality is attributed.

## Is a dashboard needed?

A dashboard is justified when it helps decide what to repeat, fix or test, and it will be consulted more than once. Otherwise a table and a paragraph of conclusions are enough. If one is built:

- A single self-contained HTML file, with no external libraries or CDN: bars as elements with percentage width and lines as SVG strokes. Animated series from libraries can appear empty when the file is opened on its own or recorded
- The identity and palette of the brand doing the analysis, never those of the source that inspired the prompt
- Large numbers when it will be recorded (at phone scale only large figures are readable), animations that respect `prefers-reduced-motion` and a stable end state
- An explicit empty state for each section without enough data
- Brand context replaced before using any external prompt. Otherwise the analysis judges the content against someone else's goals

## Competitive and campaign teardowns

When auditing another brand's campaign or reverse-engineering public content before planning your own, keep the analysis tool-agnostic and grounded in public evidence:

- **SEEN vs INFERRED:** Label every claim as `SEEN` (backed by a direct link, export or screenshot, dated) or `INFERRED` (reasoned from what was seen, stating the basis). Causal claims — that a specific ad, post or collab drove a spike or sale — are always `INFERRED`. Missing data is written as `not seen` or `not pulled`, never guessed or shown as zero.
- **Count what was pulled; never extrapolate counts:** Count ads, posts and moves from the actual rows collected. If a source truncates early, report `pulled N of M` instead of scaling it up. Reserve `low / mid / high` ranges (with the assumed rate stated) strictly for non-public financial estimates such as spend or sales.
- **Viral teardown and offer match:** For top-performing pieces, inspect the actual creative (not just metrics) and break down `hook → body → CTA`, format, length and `views ÷ followers`. Keep owned posts, paid/creator collabs and unrelated third-party or dupe posts in separate buckets, and check whether the offer pushed on social actually matches the landing page and live pricing.

## From data to the next piece

For a B2B campaign that aims to start qualified conversations, use [B2B campaign diagnosis](b2b-content.md#diagnose-the-first-weak-step) to trace the earliest weak stage before changing the copy or CTA.

The analysis result feeds Gate A of the next piece: the brief states the hypothesis to test and the success metric. Record the learning as a rule only when it repeats or has a clear cause. Preferences from a single piece stay in its contract.
