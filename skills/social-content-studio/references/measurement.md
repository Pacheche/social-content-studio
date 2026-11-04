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

## Test one variable

A test changes a single identifiable thing (opening scene, question, demonstration, format) over equivalent windows. Record hypothesis, metric, period, denominator, sample size and review date. When several things change at once, no causality is attributed.

## Is a dashboard needed?

A dashboard is justified when it helps decide what to repeat, fix or test, and it will be consulted more than once. Otherwise a table and a paragraph of conclusions are enough. If one is built:

- A single self-contained HTML file, with no external libraries or CDN: bars as elements with percentage width and lines as SVG strokes. Animated series from libraries can appear empty when the file is opened on its own or recorded
- The identity and palette of the brand doing the analysis, never those of the source that inspired the prompt
- Large numbers when it will be recorded (at phone scale only large figures are readable), animations that respect `prefers-reduced-motion` and a stable end state
- An explicit empty state for each section without enough data
- Brand context replaced before using any external prompt. Otherwise the analysis judges the content against someone else's goals

## From data to the next piece

The analysis result feeds Gate A of the next piece: the brief states the hypothesis to test and the success metric. Record the learning as a rule only when it repeats or has a clear cause. Preferences from a single piece stay in its contract.
