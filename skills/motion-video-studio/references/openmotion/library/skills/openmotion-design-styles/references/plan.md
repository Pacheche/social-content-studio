# plan.json

```json
{
  "style": "swiss",
  "title": "OpenMotion 0.1 launch",
  "seconds": 15,
  "brandColors": { "brand": "#3B5BFF" },
  "colors": ["#F5F4F0", "#111111", "#E30613"],
  "scenes": [
    { "id": "open",  "seconds": 2.5, "headline": "OpenMotion", "body": "Video, written as code.", "move": "grid lines draw, wordmark snaps into column 1", "rule": 1 },
    { "id": "one",   "seconds": 3,   "headline": "One timeline", "move": "numerals slide by whole columns", "rule": 4 },
    { "id": "two",   "seconds": 3,   "headline": "Any agent",    "move": "flush-left list builds line by line", "rule": 3 },
    { "id": "three", "seconds": 3,   "headline": "Open source",  "move": "red block arrives on the beat", "rule": 4 },
    { "id": "end",   "seconds": 3.5, "headline": "Made with OpenMotion", "body": "github.com/nexu-io/openmotion", "move": "everything slides out by columns, credit holds", "rule": 5 }
  ]
}
```

| Field | Rule |
| --- | --- |
| `style` | An id from `node scripts/style.mjs list`. |
| `title` | What the film is about. |
| `seconds` | Optional; must equal the sum of scene seconds. Total 6–60 s, 10–20 s recommended. |
| `brandColors` | Optional `{name: "#RRGGBB"}`; allowed in addition to the card palette. |
| `colors` | Every colour the composition paints. Each must be on the card or in `brandColors`. |
| `scenes[].id` | Short unique id; becomes the scene's element id prefix. |
| `scenes[].seconds` | 1–12. |
| `scenes[].headline` | ≤ 48 characters. Real content only; no invented numbers. |
| `scenes[].body` | Optional, ≤ 140 characters. |
| `scenes[].move` | The motion this scene uses, from the card's `motion` list or in the same spirit. Required. |
| `scenes[].rule` | Optional 1-based number of the card rule this scene demonstrates. At least two scenes should set it. |

The last scene must contain "OpenMotion" (the end credit).
