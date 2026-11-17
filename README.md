# Coy Discover

A standalone swipe-based "Discover" tab (Tinder/Bumble-style) next to a blank placeholder "Home" tab. Next.js 14 (App Router), mobile-first, API routes, JSON-file persistence.

## Run
```bash
npm install
npm run dev     # http://localhost:3000
```

## How it works
- **Seed:** 32 profiles in `lib/seed.js`; 11 have already liked the logged-in user (the first two in the feed, so a match shows up fast).
- **Swipe:** drag on touch/mouse, ✕/♥ buttons, or ←/→ keys. Past 110px the card flies off; otherwise it springs back.
- **Never repeats:** swipes are saved server-side, and `GET /feed` excludes anything already swiped.
- **Privacy:** the `likesYou` flag never leaves the server. `/feed` and `/matches` strip it, and `/swipe` returns only `{ match }`, which is true only when the user likes someone who already liked them.
- **Persistence:** `data/db.json` (created on first swipe, git-ignored). On Vercel it falls back to `/tmp`, which is ephemeral.

## API
| Method | Path | Notes |
|---|---|---|
| GET | `/feed` (also `/api/feed`) | Profiles not yet swiped |
| POST | `/swipe` | `{ profileId, action: "like" \| "pass" }` → `{ match: boolean }`. Re-swiping returns the original outcome |
| GET | `/matches` | Mutual matches, newest first |
| POST | `/api/reset` | Demo helper: clears swipes and matches (also the "Reset demo" button on the empty state) |

## Demo script
1. Like the first two cards → "It's a match!" screen. Open Matches.
2. Pass on a few, reload → they don't come back.
3. Swipe through all 32 → empty state → "Reset demo".
