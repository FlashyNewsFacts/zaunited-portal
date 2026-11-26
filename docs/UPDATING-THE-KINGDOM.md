# Updating the Kingdom from an iPad or iPhone

All kingdom records live in one file: **`data/kingdom.json`**.
You can edit it in Safari on GitHub. You don't need a computer or any app.

Every change is checked automatically. If something is wrong, the check fails
with a plain-English explanation and **the live site keeps its last good
version**, so a typo can never break the portal or show a wrong number.

> **Golden rule:** only enter numbers you have checked yourself on the platform
> (or in Metricool), on the day you enter them.

> **For follower counts, use the census form instead:** see
> [CENSUS.md](CENSUS.md). It reads YouTube automatically and needs no file
> editing. This guide is the **manual fallback**, and the way to record story days.

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
- Dates are `"YYYY-MM-DD"`, e.g. `"2026-11-24"`.
- Keep the commas between items exactly as they are.

---

## Recipe 1: Record follower figures by hand (fallback)

Normally you'd use the census form ([CENSUS.md](CENSUS.md)). If you can't, each
platform looks like this:

```json
"youtube": {
  "count": 7,
  "verifiedAt": "2026-11-24",
  "source": "YouTube Studio",
  "method": "manual"
},
```

| Field        | What to write                                                                   |
| ------------ | ------------------------------------------------------------------------------- |
| `count`      | The exact number you saw, with no quotes and no commas (`1250`, not `1,250`)     |
| `verifiedAt` | When you checked it: a date like `"2026-11-24"`, or a UTC time like `"2026-11-24T08:15:00Z"` |
| `source`     | Where you read it: `"YouTube Studio"`, `"TikTok profile"`, `"Instagram app"`, `"Metricool"` |
| `method`     | `"manual"` when you checked it yourself (`"automatic"` is used only by the census form) |

**Update all three platforms together** whenever you can. A milestone can only
be newly unlocked when all three counts were checked **within 48 hours** of
each other.

A platform you haven't checked can be `null` in all four fields; the site then
shows "Awaiting verification" for it and says the total is partial.

The site adds the three counts together as **"Zaunites: Combined Platform
Follows"** and always explains that one person may be counted more than once.

---

## Recipe 2: Unlock a milestone (required when one is reached)

The census form does this for you. By hand: unlocks are **permanent**. When
the combined total reaches a milestone (with all three counts checked within
48 hours), the check will **fail** until you record the date. This prevents
a milestone from silently re-locking if follower counts dip later.

Find the milestone and replace its `null` with the census date:

```json
{
  "population": 25,
  "title": "The Village of Zaun",
  "description": "Homes rise from the rubble and the first lanterns are lit.",
  "unlockedOn": "2026-12-01"
}
```

This is the date the unlock was **recorded** (shown as "Unlock recorded …"),
not the day the follower arrived. Do this **in the same edit** as the census
update that reached it. Never remove or change an `unlockedOn` date once set.

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

Each story day is recorded **once**, however many platforms or parts it was
released as. Day 1 looks like this:

```json
"storyDays": [
  {
    "day": 1,
    "title": "Season 1, Story Day 1",
    "publishedOn": "2026-11-25",
    "releases": [
      { "platform": "youtube", "label": "Day 1 (combined episode)", "status": "published" },
      { "platform": "tiktok", "label": "Part 1", "status": "published" },
      { "platform": "tiktok", "label": "Part 2", "status": "planned" },
      { "platform": "instagram", "label": "Part 1", "status": "planned" },
      { "platform": "instagram", "label": "Part 2", "status": "planned" }
    ]
  }
]
```

`releases` lists every cut of that day: these are **distribution variants of
the same day**, so five releases still move the countdown by exactly one day.
You can add a video link to any release, e.g.
`{ "platform": "tiktok", "label": "Part 1", "status": "published", "url": "https://www.tiktok.com/@zaunited_/video/…" }`.

Each release has a **status**: `"planned"` until you have confirmed it is live, then
`"published"`. The site lists published and planned versions separately, and
changing a status never moves the countdown.

For the next day, add another block after it (with a comma between):

```json
  {
    "day": 2,
    "title": "Season 1, Story Day 2",
    "publishedOn": "2026-11-26",
    "releases": [
      { "platform": "youtube", "label": "Day 2 (combined episode)", "status": "published" }
    ]
  }
```

Rules the check enforces:
- Days must go 1, 2, 3… in order with no gaps. Recording a day twice is rejected.
- A release is listed once per day, links must point to that platform, and the same video can't belong to two days.
- `publishedOn` can't be in the future and can't be earlier than the day before.
- `links` is optional. It can include `youtube`, `tiktok` and `instagram`, each a full `https://` address.

**Correcting a mistake:** edit or remove the wrong entry in a new commit. The
Git history keeps a permanent record of every change and who made it.

---

## What NOT to put in this file
- Passwords, API keys or tokens. Everything in this file ends up on the public website.
- Unpublished episode titles or scripts.
- Personal information about viewers.
