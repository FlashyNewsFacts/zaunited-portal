# Recording a census from your iPad

The **Record census** form updates the kingdom's population in a few taps.
YouTube is read **automatically**; you type in **TikTok** and **Instagram**.
The form never changes the website by itself. It opens a **pull request**
for you to check, and the site only changes when you merge it.

> Never enter a number you haven't just checked yourself.

---

## One-time setup (about 15 minutes)

### 1. Create a YouTube Data API key (free)
1. In Safari, open **console.cloud.google.com** and sign in with the
   Google account that owns the ZAUNITED channel.
2. Create a project (top bar → project picker → **New project**), e.g. `zaunited-portal`.
   No billing account is needed.
3. **APIs & Services → Library**: search **YouTube Data API v3** → **Enable**.
4. **APIs & Services → Credentials → Create credentials → API key**.
5. Tap the new key → **Edit API key**:
   - **API restrictions → Restrict key → tick only "YouTube Data API v3"** → **Save**.
   - Leave *Application restrictions* as **None**: GitHub's servers have no fixed address.
6. Copy the key. Don't paste it anywhere except the next step.

The key can only read public YouTube data. It cannot change your channel.

### 2. Save the key in GitHub (encrypted)
1. github.com → **FlashyNewsFacts/zaunited-portal** → **Settings → Secrets and
   variables → Actions → New repository secret**.
2. Name: **`YOUTUBE_API_KEY`**. Secret: paste the key. **Add secret**.

GitHub encrypts it, hides it in logs, and never shows it again (not even to you).

### 3. Let the form open pull requests
**Settings → Actions → General → Workflow permissions**: tick **"Allow GitHub
Actions to create and approve pull requests"** → **Save**.
(Leave the default permission as "Read repository contents".)

---

## Recording a census

### Step 1: Check the counts
Open the **TikTok** and **Instagram** apps (or the profiles, or Metricool) and
note the follower counts for ZAUNITED. You don't need YouTube; it's read automatically.

### Step 2: Run the form
1. github.com → **zaunited-portal** → **Actions** tab.
   (On iPhone, scroll the tab bar sideways to find it.)
2. Tap **Record census** in the list of workflows.
3. Tap **Run workflow** (on the right of the blue banner).
4. Fill in:
   | Field | What to enter |
   | --- | --- |
   | Use workflow from | leave **main** |
   | TikTok followers | the number, e.g. `3` |
   | Where you read the TikTok count | TikTok profile / TikTok app / Metricool |
   | Instagram followers | the number, e.g. `1` |
   | Where you read the Instagram count | Instagram profile / Instagram app / Metricool |
   | YouTube subscribers | **leave blank** (see "If YouTube fails" below) |
5. Tap the green **Run workflow** button.

### Step 3: Wait about 2 minutes
The run appears at the top of the list. ✅ means a pull request is ready;
❌ means nothing was proposed. Tap the run to read the message, which
explains what to fix.

### Step 4: Review the pull request
Open the **Pull requests** tab → **"Census …"**. The description shows:
- each platform's **current → proposed** count (✏️ marks changes), source, and
  whether it was read **automatically** or entered **manually**
- the new **combined platform follows**
- any **newly unlocked milestone**, and the next one
- confirmation that the Hollowing is unchanged

Check that:
- [ ] every proposed number matches what you saw
- [ ] the check **"Validate data, test, type-check and build"** shows a green ✓
      (it appears a minute or two after the pull request opens)

### Step 5: Approve and publish
1. If it's still a draft, tap **Ready for review**. Then tap **Merge pull request → Confirm merge**.
2. The live site (<https://zaunited-portal.pages.dev>) updates in about 1–2 minutes.
3. Optional: tap **Delete branch**.

**Something wrong?** Tap **Close pull request** instead. Nothing on the site
changes. Then run the form again with the right numbers.

---

## Good to know

- **Timestamps.** All three counts get the same time: when the form ran,
  stored in UTC and shown on the site in UK time (e.g. "24 November 2026, 08:15 GMT").
- **Labels.** The site marks each count **Automatic** (read from YouTube's
  official data) or **Manual check** (entered by you), with its source.
- **Milestones** unlock automatically in the pull request when the combined total
  reaches them. They're dated with the census day ("Unlock recorded …"), and
  they **never re-lock** if numbers fall later.
- **48-hour rule.** A new milestone is only accepted when all three counts were
  checked within 48 hours of each other. The form always checks all three
  together, so this is automatic. It matters only for manual file edits.
- **The Hollowing is never touched by a census.** Story days are recorded
  separately ([UPDATING-THE-KINGDOM.md](UPDATING-THE-KINGDOM.md), Recipe 3).
- **YouTube rounding.** YouTube's official data shows exact counts below
  1,000 subscribers. Above that it rounds to three significant figures
  (e.g. 1,234 is reported as 1,230).

## If YouTube fails (manual fallback)

If the run fails with *"Automatic YouTube count failed"* (or the key is
missing), run the form again and fill in **YouTube subscribers** with the
number from **YouTube Studio**. It will be labelled *Manual check · YouTube Studio*.

If the form itself is unavailable, you can still edit `data/kingdom.json`
directly ([UPDATING-THE-KINGDOM.md](UPDATING-THE-KINGDOM.md)).

## How the checks work (why you can trust a census pull request)

1. **Before the pull request exists,** the form runs the full check suite on
   the proposed data: data rules, unit tests, type-check, production build and
   built-site tests. If any fail, no pull request is opened.
2. **After it opens,** the form starts the standard **CI** check on the census
   branch. GitHub doesn't start CI automatically for pull requests opened by
   a workflow, so the form starts it explicitly. That's the green ✓ to wait for.
3. If that check is ever missing, start it yourself: **Actions → CI → Run
   workflow → choose the `census/…` branch → Run workflow**.
4. Cloudflare builds only after you merge. It isn't used as a substitute
   for these checks.

## Security

- The YouTube key lives only in GitHub's encrypted secrets. It's sent to
  Google in a request header (never in a web address), so it can't appear in logs.
- No social-media passwords or logins are used anywhere.
- Only people with write access to this private repository can run the form.
- The form can open pull requests but **cannot merge** them or change `main`;
  every census needs your approval.
- Form values are checked strictly (whole numbers and a fixed list of sources only).
