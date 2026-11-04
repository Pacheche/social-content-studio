# Text formats

Threads, long posts, LinkedIn posts and articles, Threads, Bluesky, newsletters and blog posts. Write with `strategy-and-copy.md` and `voice-and-hooks.md`; this file adds the limits and shapes of each format. Run `unslop-anything` on the draft if it is installed.

## Limits (observed 2026-11-04)

| Platform | Limit | Notes |
|---|---|---|
| X, free account | 280 characters | CJK characters count double; a URL counts 23 |
| X Premium | Longer posts; sources disagree between 4,000 and 25,000 by tier | Use 4,000 as the safe ceiling unless the account's tier is confirmed; the feed truncates with "Show more" |
| LinkedIn post | 3,000 characters | Fold at about 200-210 characters; 3-5 hashtags at most |
| LinkedIn article | Long-form | Title about 100-150 characters, verify |
| Threads | 500 characters | Links do not count, verify |
| Bluesky | 300 graphemes | Links as facets |
| Instagram caption | 2,200 characters | Fold at about 125 |

Count graphemes, not bytes: `Intl.Segmenter` in JavaScript, or `twitter-text` for X's weighting of URLs, emoji and CJK.

## What performs

- **The hook fits before the fold:** about 140 characters on X, about 210 on LinkedIn. A specific claim, a number or a tension; no throat-clearing.
- **X:** threads suit tutorials and stories, about 5-10 posts (drop-off grows past 15). Whether a thread or one long post performs better is contested; test on the account. Put external links in a reply, not in the main post. X published its ranking code; read it before trusting folklore.
- **LinkedIn:** paragraphs of one or two lines, one story or one framework per post, a specific question at the end. No "humbled to announce".
- **Threads and Bluesky:** short, conversational, led by a question.
- **Blog and SEO:** answer the question in the first 100 words; one H2 per sub-question; tables and lists; original data and examples; author byline.
- **Newsletter:** subject line about 50 characters or fewer (phones cut at about 35-40), preheader 40-90, one call to action, one column, the same send day each week.
- Never paste the same text everywhere: rewrite for each platform's limit, fold and culture.

## Email HTML

- A 600 px container (580-640), one column, mobile first, table layout with inline CSS (Outlook renders with Word's engine; Gmail strips some `<style>` blocks). Add a `color-scheme` meta tag; avoid transparent PNG logos with dark text, which vanish in dark mode.
- Gmail clips HTML over about 102 KB (code only, not images); a clipped footer hides the unsubscribe link. Keep the HTML under about 80 KB, minified, without base64 images.
- Images at 2x (1200 px wide) with alt text, width and height; GIFs under 1 MB; no JavaScript, forms or embedded video (link a thumbnail instead); a plain-text version.
- Bulk senders need SPF, DKIM and DMARC, one-click unsubscribe and a spam rate under 0.3%.
- Substack takes rich text only, no custom HTML; beehiiv has a block editor with custom HTML and an API on paid plans. For a custom sender: MJML to HTML, then inline the CSS with `juice`.
- QA: a local mail catcher (Mailpit), real test sends to Gmail, Outlook and Apple Mail, dark-mode screenshots, the HTML size check, every link and UTM tag.

## QA for every text piece

Grapheme count under the limit, the hook visible before the fold, links and tags checked, spelling, the writer's voice preserved, no stock lines ("not X, it's Y", "unlock", "game changer"), hashtags kept to a few.
