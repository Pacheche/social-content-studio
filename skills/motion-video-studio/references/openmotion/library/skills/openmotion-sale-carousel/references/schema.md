# carousel.json

```json
{
  "brand": { "name": "Fieldwork Supply", "accent": "#ff3b30" },
  "occasion": "Black Friday",
  "title": "Gifts under $100",
  "postDate": "2026-11-26T09:00:00-05:00",
  "products": [
    { "name": "Court Sneaker", "image": "sneaker.jpg", "was": 95, "discount": { "percent": 30 } },
    { "name": "Rangefinder Camera", "image": "camera.jpg", "was": 140, "now": 99 },
    { "name": "Enamel Camp Mug", "image": "mug.jpg", "was": 18, "discount": { "amount": 6 } }
  ],
  "currency": "USD",
  "locale": "en-US",
  "code": "FRIDAY40",
  "deadline": { "label": "Ends Mon, Dec 1 · 11:59 pm ET", "date": "2026-12-01T23:59:00-05:00" },
  "cta": "Shop all deals",
  "url": "fieldworksupply.example",
  "aspect": "9:16",
  "labels": { "off": "off", "useCode": "Code" }
}
```

| Field | Rule |
| --- | --- |
| `title` | Required, ≤ 26 characters. |
| `products` | 3–7 items. Each needs `name` (≤ 26 characters), `image` next to the file, `was`, and exactly one of `discount.percent` (1–95), `discount.amount` (below `was`) or `now` (below `was`). |
| `code` | Optional, 3–16 of `A–Z 0–9 -`. |
| `deadline` | Optional; when given, `label` ≤ 34 characters and `date` ISO 8601 with offset, after `postDate`. |
| `cta` | Required, ≤ 20 characters. `url` ≤ 32 characters. |
| `brand`, `occasion`, `theme`, `currency`, `locale`, `aspect`, `labels` | As in the sale-promo Skill. |
