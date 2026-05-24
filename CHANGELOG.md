# Changelog

## 1.2.0 — mrkvka fork

### Fixed

- Default API host is `https://rutracker.org` (HTTP redirect broke login).
- Login stores every `Set-Cookie` value (`bb_ssl` + `bb_session`), not only the first header.
- Login fails if `bb_session` is missing after a 302 response.

### Changed

- `axios` updated to 1.x.
- `npm run lint` works on Windows (no `./node_modules/.bin` path).
- Repository metadata points to `mrkvka/rutracker-api`.
