# countdown.json

```json
{
  "brand": { "name": "Fieldwork Supply", "accent": "#ff3b30" },
  "occasion": "Black Friday",
  "theme": "black-friday",
  "mode": "starts",
  "postAt": "2026-11-20T09:00:00-05:00",
  "target": { "date": "2026-11-27T00:00:00-05:00", "label": "Fri, Nov 27 · 12:00 am ET" },
  "unit": "days",
  "images": ["sneaker.png", "watch.png", "perfume.png"],
  "teaser": "Up to 40% off sitewide",
  "cta": "Get early access",
  "url": "fieldworksupply.example",
  "aspect": "9:16",
  "labels": { "starts": "starts in", "ends": "ends in", "days": "days", "hours": "hours", "left": "to go" }
}
```

| Field | Rule |
| --- | --- |
| `mode` | `starts` (default) counts to the start of the sale; `ends` counts to its end. |
| `postAt`, `target.date` | ISO 8601 with offset. The number on screen is `floor((target − postAt) / unit)`. |
| `target.label` | Required, ≤ 34 characters: the date the way the shop writes it. |
| `unit` | Optional `days` or `hours`; default days when ≥ 2 days are left. Result must be 1–99. |
| `images` | Optional, up to 4 photos next to the file; they float in front of the number one after another; transparent PNG cutouts look best. |
| `teaser` | Optional, ≤ 30 characters; only a public, real offer. |
| `cta` | Required, ≤ 20 characters. `url` ≤ 32 characters. |
| `brand`, `occasion`, `theme`, `aspect`, `labels` | As in the sale-promo Skill. `labels.left` defaults to "to go" (starts) or "left" (ends). |
