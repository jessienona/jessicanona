# Tether

A real implementation of the "Canon R5 photo tethering app" designed in Claude
Design (see `project/` and `chats/` for the original mockups and design
conversation, preserved as `project/HANDOFF.md`). Two apps, one backend:

- **`apps/photographer`** — the photographer's app. Camera pairing, a live
  shot feed, per-photo detail/pull/star, culling, a QR share screen, and
  watermark/delivery settings + stats.
- **`apps/guest`** — the guest-facing gallery a QR code opens. Landing page,
  browse-and-select gallery, a "find my photos" selfie-match flow, and a
  single-photo download view.
- **`apps/server`** — the backend both apps talk to: real photo ingest (FTP
  server + Canon CCAPI client), image processing, session/delivery state,
  and a WebSocket feed that keeps both apps live.
- **`packages/shared`** — design tokens (colors/fonts) and constants shared
  by both frontends.

## Phone and iPad

Both apps are responsive, not phone-only: content is capped and centered at
a readable width (`packages/shared`'s `layout` tokens) rather than stretched
edge-to-edge, and the feed/gallery grids use `auto-fill` so they pick up
extra columns on a wider screen automatically — no separate "tablet layout"
to maintain. They're also installable as standalone apps from iPad Safari's
Share ▸ Add to Home Screen (icons, manifest, and `apple-mobile-web-app-*`
meta tags are already wired up in each app's `index.html`/`public/`) — handy
for a photographer who runs this from a mounted iPad instead of a phone.

## What's real vs. what needs your hardware/credentials

This is a working full-stack app, not a mockup — but a few pieces genuinely
need things this environment doesn't have:

| Piece | Status |
|---|---|
| FTP ingest, image pipeline (thumbnails/previews/watermarking), SQLite storage, WebSocket live updates, QR generation, cloud-sync queue, guest downloads | **Real, tested end-to-end** (see "Try it" below) |
| On-device face matching (`face-api.js`) | **Real** — runs in-browser on both apps, models vendored in `public/models`. Untested with an actual face since this environment has no camera; the matching math and integration are exercised by the code, not by a live selfie. |
| Canon CCAPI client (`apps/server/src/ccapi.js`) | Implemented to Canon's published spec, but **never exercised against a real R5** — this environment has no camera on a LAN to test against. Verify the endpoint paths against your camera's reported CCAPI version before relying on it. |
| Cloud sync | Real queue + drain worker. Defaults to a **local-disk adapter** (`data/cloud/`) so the whole flow runs with no credentials; swap in real S3 by setting `AWS_S3_BUCKET` (see `apps/server/.env.example`). |

## Quick start

```bash
npm install
npm run dev          # starts server (:4000), photographer (:5173), guest (:5174)
```

Open `http://localhost:5173` for the photographer app. It auto-creates a
session, so hit **Start session** and you're on the live feed.

### Try it without a camera

The server ships a script that pushes real JPEGs over real FTP into the
ingest pipeline — the same path a Canon R5 would use:

```bash
npm run simulate-camera        # uploads 5 frames, ~1.2s apart
npm run simulate-camera -- 20 400   # 20 frames, 400ms apart
```

Watch them land live on the feed. Open the QR screen and scan it (or copy
the join URL it prints from `GET /api/session/:id/qr`) to see the guest
gallery update in real time from a second device on the same network.

## Pointing at a real Canon EOS R5

Two independent ways to get shots off the camera — pick one, or run both:

1. **FTP (recommended to start with)** — On the R5: `Menu ▸ Network settings
   ▸ FTP transfer ▸ FTP server`. Point it at this machine's LAN IP, port
   `2121` (or whatever `FTP_PORT` is set to), user/pass from
   `apps/server/.env` (`FTP_USER`/`FTP_PASS`, default `r5` / `tether`). Shoot
   JPEG (or RAW+JPEG and let the camera send just the JPEG) — files land in
   `data/incoming` and ingest automatically.
2. **CCAPI** — for live camera status (battery, card space, serial) on the
   Connect screen. Requires current firmware and CCAPI activated once via
   Canon's desktop registration tool (see the "how can I make this app live"
   answer in `chats/chat1.md` for the full rationale). Once activated, set
   the camera's IP via `PATCH /api/session/:id` (`cameraIp`) — the connect
   screen will start polling it.

Either way, guests need a network to join. `hotspot` mode assumes a travel
router (or the R5/phone's own hotspot) that the photographer's device, the
camera, and guests all join — no internet required, and the QR encodes the
LAN IP. `cloud` mode assumes real internet and a real `CLOUD_BASE_URL` /
S3 bucket for production use.

## Environment variables

See `apps/server/.env.example` for the full list (FTP port/credentials, QR
join-URL overrides, S3 cloud adapter). Everything has a working dev default.

## Project layout

```
apps/
  server/         Express + ws backend, FTP server, CCAPI client, SQLite
  photographer/   Vite + React, dark theme, the photographer's screens
  guest/          Vite + React, light theme, the guest-facing screens
packages/
  shared/         design tokens + constants shared by both apps
project/          original Claude Design prototype (.dc.html) + assets
chats/            the design conversation this was built from
```

## Notes on scope

- The photographer/guest split mirrors two separate real products sharing
  one backend, rather than the original prototype's single file with a
  dev-only Photographer/Guest toggle — that toggle was a Claude Design
  preview convenience, not part of the shipped experience.
- The fake iOS status bar and phone-bezel chrome in the prototype were
  Claude Design's device-preview frame, not real app UI — dropped in favor
  of each browser's actual mobile chrome.
- Session/gallery "filter chips" (Ceremony/Toasts) are carried over as
  static UI from the prototype — no photo-tagging backend exists yet.
