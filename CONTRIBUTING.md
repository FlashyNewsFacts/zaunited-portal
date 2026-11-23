# Contributing to the ZAUNITED Kingdom Portal

Thank you for wanting to help build the Kingdom of Zaun! ⚔️

> The repository is currently **private** while the first version is built.
> These guidelines are ready for when it opens to community developers.

## Ground rules

- Be kind. Everyone must follow our [Code of Conduct](CODE_OF_CONDUCT.md).
- **Never** commit secrets (API keys, tokens, passwords), `.env` or `.dev.vars` files.
- Don't add private ZAUNITED/StoryForge material: production code, unpublished
  scripts, unreleased episodes or private artwork.
- **Never invent follower figures.** Numbers in `data/kingdom.json` must be
  verified by the ZAUNITED team, with a source and date.
- Story continuity belongs to ZAUNITED: the Prophecy (Day 0) and historical
  Episode 1 are not changed by the portal.

## How to contribute

1. Open an issue (or comment on one) describing what you'd like to change.
2. Fork the repository and create a branch, e.g. `feature/better-milestone-art`.
3. Make your change, then run `npm run verify` (data checks, tests, type-check, build).
4. Open a pull request using the template. CI must be green.
5. A maintainer reviews every pull request before it is merged into `main`.

## Code style

- Keep the site fast: avoid new dependencies unless clearly needed, and avoid
  large client-side libraries.
- Mobile first: check changes on a phone-sized screen (iPhone/iPad are priorities).
- Accessibility: keep good contrast, visible focus, meaningful alt text, and
  respect `prefers-reduced-motion`.
- Plain, friendly British English in user-facing text.

## Good first contributions

Look for issues labelled `good first issue` (once issues are enabled publicly).
