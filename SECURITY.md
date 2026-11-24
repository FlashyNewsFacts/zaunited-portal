# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report them privately through GitHub's
[private vulnerability reporting](https://github.com/FlashyNewsFacts/zaunited-portal/security/advisories/new)
(maintainers: enable it under *Settings → Code security*). Include what you
found, how to reproduce it and the possible impact. We aim to reply within a
week.

## Current security posture (MVP)

- The site is fully static, ships no JavaScript and blocks all scripts via
  Content-Security-Policy (`public/_headers`).
- No accounts, forms, cookies, analytics or personal data.
- No secrets in the repository. The only credential is `YOUTUBE_API_KEY`, a
  read-only key restricted to the YouTube Data API, stored as an encrypted
  GitHub Actions secret. It's sent in a request header (never a URL) and is
  available only to the "Record census" workflow, which can open pull
  requests but cannot merge them.
- CI runs with read-only permissions and no secrets, so pull requests from
  forks can't access credentials.

## Future features

Anonymous suggestions and voting (planned) will add server-side validation,
rate limiting, bot protection, moderation before publication, and an admin
area protected by Cloudflare Access. These will get a security review before launch.
