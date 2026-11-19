# Research: find every move that grew it

The goal is a timeline a skeptical growth lead would accept: each move dated, each number sourced, and the curve's bends explained by moves that came just before them.

## Search plan (about 20–70 calls)

Run these in parallel with the host's search and fetch tools. Use whichever search providers are available; more independent engines find more dated moves.

| Pass | Query / target | Finds |
| --- | --- | --- |
| Metric | `"<Company>" ARR` · `run rate` · `revenue` · `users` · `valuation` (last 24 months) | Metric points and who reported them |
| News | `"<Company>"` in news search, newest first; read the full text of the 10 most relevant | Dated launches, deals, programs, rounds |
| Free & pricing | `"<Company>" free` · `unlimited` · `trial` · `price` · `discount` · `promo` | Free windows, pricing changes |
| Creators | `"<Company>" creators` · `affiliate` · `ambassador` · `contest` · `sponsored` · YouTube search | Creator programs, paid creator push, contests |
| Community | Reddit, X, Hacker News, Product Hunt | Viral moments, launch days, sentiment spikes |
| Search/SEO | The sitemap (`/sitemap.xml`, `/robots.txt`), blog index, `/models`, `/tools`, `/vs`, `/alternatives`, language prefixes | Programmatic pages, page counts, languages, agent pages (`/mcp`, `/skills`, `llms.txt`) |
| Product | Pricing page, changelog, release notes, GitHub releases/stars for open source | Launch dates, integrations, distribution |
| Funding | Rounds, investors, valuations; Crunchbase-style press | Fundraising lane |

Prefer the original source: the company's own post, the founder's post, the filing, the reporter's article. A recap that cites someone else is a pointer, not a source: follow it to the original.

## What counts as a move

A move is a **dated, deliberate action** by the company that could plausibly change acquisition, activation, conversion or retention:

- Free windows: "free for 24 h", "unlimited for 33 days", free tier changes, trials.
- Creators & partners: paid creator posts, affiliate/ambassador programs, contests, co-marketing, distribution deals, marketplace listings.
- Search & distribution: model/tool name pages, comparison pages, translations, docs for agents, integrations, app-store launches.
- Product launches that were marketed: new model day-one support, viral feature, major release.
- Pricing: new plans, price cuts, credits, annual discounts.
- Fundraising: round size, valuation, notable investors.

Not a move: generic praise, opinion pieces, undated claims, rumours, moves by competitors.

## Metric points

- Use one metric family for the curve (prefer revenue run rate / ARR; else users; else open-source stars or downloads). Do not mix families on one curve.
- Each point: date (month at least), value, `kind` (`company`, `press`, `estimate`), reporter and URL.
- 4–10 points is ideal. If two sources disagree for the same month, keep the more original one and note the other in `note`.
- The headline figure (`metric.headline`) is the latest point; its subtitle names the date and the reporter.

## Lanes and plays

- 3–4 lanes, named by mechanism in 1–2 words. 2–5 moves per lane on screen; extra moves stay in the data with `"show": false`.
- A play is chosen when its lane's moves sit right before a bend in the curve, or a source explicitly attributes growth to it (quote that source in the play's evidence).
- Each play: `headline` (≤ 6 words, ends with a period, states the mechanism and effect), `stat` (a counted fact from the data: "4 free windows in 16 months", "369 pages on the sitemap", "$300M run rate in 11 months"), 2–3 evidence moves, and `instruction` (one paragraph a team can execute next week, written in imperative voice).
- Order plays by strength of evidence, not by chronology.

## Write the teardown

Alongside the film, write `TEARDOWN.md`: one-sentence answer ("<Company> grew by …"), the curve with its sourced points, the three plays (claim, evidence links, instruction), what is estimated or unknown, and the full source list. This is what the user forwards; the film is what they post.

## Time and cost

A full teardown typically needs 40–80 search/fetch calls. Cache raw results in `research/` next to `growth.json` so a re-render or a correction never repeats the search.
