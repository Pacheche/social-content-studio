# growth.json

One file drives the film and the teardown. `scripts/build.mjs --check growth.json` validates it.

```jsonc
{
  "company": "Higgsfield",
  "domain": "higgsfield.ai",            // used for the outro and the sources scene
  "lang": "en",                         // "en" or "zh"
  "brand": { "accent": "#3b5bff", "logo": "evidence/logo.png" }, // optional; accent drives the curve
  "research": {                         // shown in the sources scene; counts must be real
    "calls": 70,
    "engines": ["google", "bing", "duckduckgo", "reddit", "x", "youtube", "github", "wikipedia", "news", "sitemap"],
    "minutes": 4
  },
  "metric": {
    "label": "Run rate",                // "ARR", "Users", "GitHub stars"...
    "unit": "$",                        // "$", "", "★"; prefix for currency
    "headline": { "value": 1350000000, "note": "Nov 2026 · SaaStr" },
    "points": [
      { "date": "2025-08", "value": 20000000, "kind": "press",
        "source": { "title": "…", "publisher": "Forbes", "url": "https://…" } }
    ]
  },
  "lanes": [
    { "id": "free", "name": "Free windows",
      "moves": [
        { "date": "2025-07-02", "label": "Soul goes free",
          "source": { "title": "Higgsfield's viral AI image generator is now free for everyone",
                      "publisher": "BGR", "url": "https://…", "image": "evidence/free-1.jpg" } }
      ] }
  ],
  "plays": [
    { "lane": "free",
      "headline": "free windows sped up growth.",
      "stat": { "value": 4, "suffix": "", "label": "free windows in 16 months" },
      "evidence": ["free:0", "free:2", "free:3"],   // "<laneId>:<moveIndex>"
      "cardTitles": ["Soul goes viral, then free", "24h free, every model", "72h free trial"],
      "instruction": "Every time we ship a model, open a 24–72h free window, announce the end date up front, and measure sign-ups and the run-rate step the week after." }
  ]
}
```

## Field rules

| Field | Rule |
| --- | --- |
| `date` | `YYYY-MM` or `YYYY-MM-DD`. Required on every point and move. |
| `label` | ≤ 28 characters (≤ 14 Chinese characters). The full headline goes in `source.title`. |
| `metric.points` | ≥ 3 points, one metric family, ascending dates, each with `source.url`. |
| `kind` | `company` (the company said it), `press` (reported by media), `estimate` (third-party estimate). |
| `lanes` | 2–4 lanes, each 1–6 moves; `"show": false` hides a move from the film but keeps it in the record. |
| `plays[].instruction` | ≤ 220 characters so it fits its card; keep the longer version in `TEARDOWN.md`. |
| `plays` | Exactly 3 (2 allowed when evidence is thin). `evidence` lists 2–3 moves; `cardTitles` are optional ≤ 30-character captions above each evidence card. |
| `stat.value` | A number that counts up on screen; `suffix` (e.g. "M") and `prefix` (e.g. "$") are optional. |
| `source.image` | A local file (from `scripts/evidence.mjs`) or omitted; omitted cards render as press clippings. |
| `card` | Optional drawn evidence instead of an image: `{"type":"chips","items":["es","ja"]}`, `{"type":"list","items":["/mcp/ugc"]}` or `{"type":"stat","value":"71","label":"/mcp pages"}`. Items must come from the source. |
| `plays[].wallQuery` | Optional YouTube search whose result thumbnails form the wall behind that play's cards (`wall` and `wallSource` are filled by `evidence.mjs`). |
| `brand.logo` | The company's own icon; `evidence.mjs` fetches it from the site when missing. |

The generator derives the timeline range from the earliest and latest dates, places every move on the curve's time axis, and highlights the curve after each move of the play being shown.
