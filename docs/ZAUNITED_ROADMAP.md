# ZAUNITED — Project Roadmap

**Status:** Approved strategic direction; implementation phases are not blanket authorization to build.
**Primary home:** `zaunited-portal/docs/ZAUNITED_ROADMAP.md` (private repository during development)
**Motto:** *From nothing, we shall rise.*

## Vision
ZAUNITED is a community-driven medieval fantasy-comedy story about King Mesmer rebuilding the Kingdom of Zaun before the Hollowing arrives. Viewers should see their participation reflected in the kingdom's visible growth and future storytelling. Use the supplied Comentopia reference as inspiration for **numbered-day progression, visible world changes, and community influence**, not as a design or content to copy.

## Phase 1 — Kingdom Portal (CURRENT PRIORITY)
Build a fast, mobile-first, publicly accessible website, with no visitor account required. Keep the GitHub source repository private until explicitly approved otherwise.

**M0–M1 MVP:** ZAUNITED identity and approved imagery; official YouTube, TikTok and Instagram follow links; verified population with source and update time; milestone progress; Hollowing story-day countdown; links back to episodes. A simple, accessible, polished mobile experience comes before advanced features.

**Population rule:** Kingdom progression uses **combined platform follows** = YouTube subscribers + TikTok followers + Instagram followers. This is **not a deduplicated count of unique humans**; label the combined figure clearly and explain overlap. Never fabricate counts. Milestones remain unlocked once legitimately reached, even if current figures fall.

**Milestones:** 1 — The First Zaunite; 10 — A Small Settlement; 25 — The Village of Zaun; 50 — Defences of Zaun; 100 — First Target: 100 Zaunites. Display progress and actual verified unlocks; don't invent upgrades.

**Story-day rule:** The Prophecy is the frozen Day 0 opening promo. Show **30 STORY DAYS REMAIN** until an official story-day episode is published and recorded. Neither a calendar day nor historical Episode 1 automatically advances the countdown.

**Later phases, separate approval:** reliable periodic platform-stat updates; anonymous moderated upgrade suggestions; Royal Council polls with anti-spam controls and clear limitations on one-person-one-vote; secure admin tools; optional public-source contributions. The portal must never expose credentials, private production code, unpublished scripts, or StoryForge internals.

## Phase 2 — Community-driven storytelling (AFTER portal review)
Develop an original ZAUNITED short-form format inspired by the reference's clear **SEASON / DAY** progression, striking hooks, visible changes between episodes, and viewer-driven choices.

Each future episode should, where appropriate:
- Open with a compelling visual or question rather than a long pause.
- Briefly acknowledge verified growth or a genuinely unlocked building.
- Show the tangible result of earlier viewer choices or progress.
- Give King Mesmer an entertaining obstacle, reaction, or unintended consequence.
- End with a meaningful question or choice that invites viewers back.

The story is **not** automatically rewritten by raw comment counts or unverified votes. Community choices are editorial inputs and require approval. Do not promise daily publishing; story days advance only on confirmed publication of official story-day episodes. Do not copy another creator's assets, scripts, exact episode concepts, or branding.

## Phase 3 — Repeatable Claude-assisted production
For each approved new episode, Claude should prepare a reviewable production package: story outline, hook and retention beats, exact narrator text, Mesmer's silent gestures and written bubbles, shot/timeline instructions, phrase-level captions, sound-effect cue sheet, and export/CapCut handoff notes.

**Creative rules:** Mesmer remains mute; the narrator never reads his bubbles; narration and narrator captions do not overlap bubble moments; captions avoid his face, important action, speech bubbles, title cards, and platform UI safe areas. Keep the approved emphasis colour language (gold for kingdom/hope/countdown, violet for prophecy/Hollowing, red for intentional punchlines such as NO MONEY) where relevant. Prioritize readable, scene-aware placement and lively but natural pacing. Voiceover can be generated with Google's TTS; fit and verify narration against scenes. Music and final effects/mixing may remain in CapCut unless separately approved. Relevant thunder, weather, magic, quill typing, and expressive comic sounds should match actual on-screen events.

Use verified kingdom state in future narrator lines, including milestones and upgrades, but never invent progress. Show drafts and previews for approval before final production. Preserve the frozen Prophecy, historical Episode 1, and approved masters.

## Separation and approval boundaries
- `zaunited-portal`: website and community experience; private GitHub repository during development; public website only after explicit deployment approval.
- `storyforge`: separate private animation/production studio. Do not copy or modify its source, engines, Prophecy, historical Episode 1, or export workflow without explicit authorization.
- Current authorized work remains **M0–M1 portal MVP on the approved working branch**, with preview and review before merge/deploy. This roadmap **does not** authorize starting Phase 2/3 or M2+ portal features.
- If `CLAUDE.md` or `README.md` already exist, add a short link to this roadmap without overwriting existing guidance. Prefer a separate documentation-only commit or PR, coordinated with the current active Claude Code task to avoid conflicts.

## Decision log
- 2026-11-23: Portal first; no-account public visitor experience; private development repository; combined platform follows for milestones; permanent unlocks; community-driven episode direction inspired by the supplied social-channel reference; Claude-assisted production only after portal progress.

## Next checkpoint
Review Claude Code's M0–M1 preview for mobile appearance, links, truthful counters, milestone state, story-day handling, performance, and repository safety. Then decide on deployment and the subsequent episode-production directive.
