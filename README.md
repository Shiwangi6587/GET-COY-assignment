# Coy Discover

A swipe-based **Discover** tab for Coy, built as a standalone app next to a blank placeholder **Home** tab. Next.js 14 (App Router), mobile-first, API routes, JSON-file persistence, Vitest tests.

The idea: Coy's promise is that crushes stay secret unless they're mutual. Discover keeps that promise end to end: likes are never revealed, and even identities can stay hidden until both people choose to reveal.

## Run
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 25 tests: privacy rules, matching, limits, chat, reveal, HTTP routes
```

## Features
- **Swipe:** drag on touch/mouse, ✕/♥ buttons, or ←/→ keys. LIKE/PASS stamps fade in as you drag. Swiped profiles never come back.
- **Matching:** only a mutual like matches. "It's a match!" screen, then a Matches list.
- **Anonymous profiles:** some profiles show a codename and no photo (the real name and photo URL are never sent) until a mutual reveal.
- **Anonymous chat:** chat opens on a match. Tap "Reveal my identity" and names/photos appear only when both sides have revealed. (The other side is simulated: replies arrive after 1.5s, and some people don't reveal back.)
- **Campus filter:** Everyone / My campus.
- **Shared interests:** "N in common" badge on cards, highlighted interests, and a line on the match screen.
- **Daily like limit:** 15 likes per day (a stand-in for Coy's paid slots); passing is always free.
- **Undo:** takes back the last swipe (never a match).
- **You tab:** show/hide your name and photo, invite a friend (native share sheet, or copy link), Reset demo.

## Privacy rules (enforced in `lib/engine.js`, covered by tests)
- `likesYou` and `willReveal` never leave the server. Every profile is serialised through one function, `view()`.
- `POST /swipe` has the same response shape whether or not the person liked you; only `match` differs, and it is true only when mutual.
- Repeat swipes return the original outcome and can't flip it. Concurrent swipes can't create duplicate matches (load-modify-save runs synchronously).
- Chat and reveal only work for matches.

## API
| Method | Path | Notes |
|---|---|---|
| GET | `/feed` (also `/api/feed`) | Unswiped profiles. `?campus=mine` filters by campus. Also returns `likesLeft` |
| POST | `/swipe` | `{ profileId, action: "like" \| "pass" }` → `{ match, likesLeft }`. 429 when out of likes |
| GET | `/matches` | Mutual matches, newest first |
| POST | `/api/undo` | Undo last swipe. 409 if it was a match |
| GET / POST | `/api/messages` | `?profileId=` to read, `{ profileId, text }` to send. Matches only |
| POST | `/api/reveal` | `{ profileId }`. Identity shows once both sides reveal |
| GET / PATCH | `/api/me` | Your settings (`anonymous`) and likes left |
| POST | `/api/reset` | Demo helper: clears everything |

## Structure
`lib/engine.js` holds all rules as pure functions over a db object (easy to test). `lib/db.js` persists to `data/db.json` (git-ignored; `/tmp` on Vercel, which is ephemeral). `lib/seed.js` has 32 profiles; 11 have already liked you, and the first two in the feed are among them.

## Demo script
1. Like card 1 (named) → match screen → "Say hi" → chat.
2. Pass, then Undo.
3. Like card 2 (anonymous) → match → chat → "Reveal my identity".
4. You tab → hide your name and photo. Try My campus. Swipe past 15 likes to see the limit.
