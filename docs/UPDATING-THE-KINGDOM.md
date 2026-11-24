# Updating the Kingdom from an iPad or iPhone

All kingdom records live in one file: **`data/kingdom.json`**.
You can edit it in Safari on GitHub. You don't need a computer or any app.

Every change is checked automatically. If something is wrong, the check fails
with a plain-English explanation and **the live site keeps its last good
version**, so a typo can never break the portal or show a wrong number.

> **Golden rule:** only enter numbers you have checked yourself on the platform
> (or in Metricool), on the day you enter them.

---

## How to edit the file (Safari on iPad/iPhone)

1. Open the repository on github.com and tap **`data`**, then **`kingdom.json`**.
2. Tap the **pencil icon** (✏️ "Edit this file"). On iPhone it may be in the **⋯** menu.
3. Make your change (see the recipes below).
4. Tap **Commit changes…**
5. Write a short message, e.g. `Census 23 Nov: YT 4, TT 7, IG 2`.
6. Choose **"Create a new branch and start a pull request"**, then open the pull request.
7. Wait for the green ✔ check on the pull request (about a minute), then
   **merge** it. The live portal (<https://zaunited-portal.pages.dev>)
   updates automatically about 1–2 minutes later.

If the check shows a red ✖, tap **Details**. The message says exactly
what to fix. Edit the file again on the same branch.

### Typing tips
- Use straight quotes `"like this"`. If your keyboard inserts curly quotes
  (`“like this”`), turn off **Settings → General → Keyboard → Smart Punctuation**.
- Numbers have **no quotes**: `"count": 12` ✔ `"count": "12"` ✖
- Dates are always `"YYYY-MM-DD"`, e.g. `"2026-11-23"`.
- Keep the commas between items exactly as they are.

---

## Recipe 1: Record follower figures (the census)

Each platform looks like this:

```json
"youtube": {
  "count": null,
  "verifiedOn": null,
  "source": null
},
```

To record a verified count, replace all three `null` values:

```json
"youtube": {
  "count": 4,
  "verifiedOn": "2026-11-23",
  "source": "YouTube Studio"
},
```

| Field        | What to write                                                                   |
| ------------ | ------------------------------------------------------------------------------- |
| `count`      | The exact number you saw, with no quotes and no commas (`1250`, not `1,250`)     |
| `verifiedOn` | The date you checked it                                                          |
| `source`     | Where you read it: `"YouTube Studio"`, `"TikTok app"`, `"Instagram app"`, `"Metricool dashboard"` |

Platforms you haven't checked can stay `null`; the site then shows
"Awaiting verification" for that platform and says the total is partial.

The site adds the three counts together as **"Zaunites: Combined Platform
Follows"** and always explains that one person may be counted more than once.

---

## Recipe 2: Unlock a milestone (required when one is reached)

Unlocks are **permanent**. When the combined total reaches a milestone, the
check will **fail** until you record the date it was reached. This prevents a
milestone from silently re-locking if follower counts dip later.

Find the milestone and replace its `null`:

```json
{
  "population": 10,
  "title": "A Small Settlement",
  "description": "Tents and campfires gather around the ruined throne.",
  "unlockedOn": "2026-11-23"
}
```

Do this **in the same edit** as the census update that reached it. Never remove
an `unlockedOn` date once it has been set.

### Adding a new milestone later

Add a new block at the end of the `milestones` list (remember the comma after
the previous `}`), with a population higher than the last one and
`"unlockedOn": null`.

---

## Recipe 3: Record a published story day (the Hollowing countdown)

The countdown is **story time**: it only moves when you record a story-day
episode that has **already been published**. Nothing changes at midnight.

- The **Prophecy of Zaun is the frozen Day 0 opening promo**. It is not listed in `storyDays`.
- The Hollowing begins at **30 story days remaining**.
- **Historical Episode 1** is kept separately and does **not** advance the countdown.
- Only a **verified, officially published** story-day episode advances the countdown.
- `storyDays` starts empty: `"storyDays": []` → **30 story days remain**.

To record Day 1, change `"storyDays": []` to:

```json
"storyDays": [
  {
    "day": 1,
    "title": "Title of the episode",
    "publishedOn": "2026-11-30",
    "links": {
      "youtube": "https://www.youtube.com/watch?v=..."
    }
  }
]
```

For the next day, add another block after it (with a comma between):

```json
  {
    "day": 2,
    "title": "Title of the next episode",
    "publishedOn": "2026-12-01"
  }
```

Rules the check enforces:
- Days must go 1, 2, 3… in order with no gaps.
- `publishedOn` can't be in the future and can't be earlier than the day before.
- `links` is optional. It can include `youtube`, `tiktok` and `instagram`, each a full `https://` address.

**Correcting a mistake:** edit or remove the wrong entry in a new commit. The
Git history keeps a permanent record of every change and who made it.

---

## What NOT to put in this file
- Passwords, API keys or tokens. Everything in this file ends up on the public website.
- Unpublished episode titles or scripts.
- Personal information about viewers.
