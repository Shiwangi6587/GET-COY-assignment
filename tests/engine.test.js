import { describe, it, expect } from 'vitest';
import { PROFILES } from '@/lib/seed';
import { emptyDb, feed, swipe, undo, matches, thread, send, reveal, ME } from '@/lib/engine';

const NOW = Date.UTC(2026, 0, 10, 12);
const liker = PROFILES.find((p) => p.likesYou && !p.anonymous);
const nonLiker = PROFILES.find((p) => !p.likesYou);
const anonLiker = PROFILES.find((p) => p.likesYou && p.anonymous && p.willReveal);
const shyAnon = PROFILES.find((p) => p.likesYou && p.anonymous && !p.willReveal);

describe('seed data', () => {
  it('has 30+ profiles, some who already like the user', () => {
    expect(PROFILES.length).toBeGreaterThanOrEqual(30);
    expect(PROFILES.some((p) => p.likesYou)).toBe(true);
  });
});

describe('privacy: nobody learns who liked them', () => {
  it('never exposes server-only fields in the feed or matches', () => {
    const db = emptyDb();
    swipe(db, liker.id, 'like', NOW);
    const out = JSON.stringify([feed(db), matches(db)]);
    expect(out).not.toContain('likesYou');
    expect(out).not.toContain('willReveal');
  });
  it('shows a codename and no photo or real name for anonymous profiles', () => {
    const out = JSON.stringify(feed(emptyDb()).profiles.find((p) => p.id === anonLiker.id));
    expect(out).toContain(anonLiker.codename);
    expect(out).not.toContain(anonLiker.name);
    expect(out).not.toContain(anonLiker.photo);
  });
  it('responds with the same shape whether or not they liked you', () => {
    const a = swipe(emptyDb(), liker.id, 'like', NOW);
    const b = swipe(emptyDb(), nonLiker.id, 'like', NOW);
    expect(Object.keys(a).sort()).toEqual(Object.keys(b).sort());
  });
  it('a one-sided like never becomes a match', () => {
    const db = emptyDb();
    expect(swipe(db, nonLiker.id, 'like', NOW).match).toBe(false);
    expect(matches(db).matches).toHaveLength(0);
  });
  it('passing on someone who liked you never matches', () => {
    const db = emptyDb();
    expect(swipe(db, liker.id, 'pass', NOW).match).toBe(false);
    expect(matches(db).matches).toHaveLength(0);
  });
});

describe('matching', () => {
  it('liking someone who liked you creates exactly one match', () => {
    const db = emptyDb();
    expect(swipe(db, liker.id, 'like', NOW).match).toBe(true);
    swipe(db, liker.id, 'like', NOW);
    expect(matches(db).matches.map((m) => m.id)).toEqual([liker.id]);
  });
  it('a repeat swipe cannot change the outcome', () => {
    const db = emptyDb();
    swipe(db, liker.id, 'pass', NOW);
    expect(swipe(db, liker.id, 'like', NOW)).toMatchObject({ match: false, alreadySwiped: true });
    expect(matches(db).matches).toHaveLength(0);
  });
  it('swiped profiles never return to the feed', () => {
    const db = emptyDb();
    swipe(db, nonLiker.id, 'pass', NOW);
    expect(feed(db).profiles.some((p) => p.id === nonLiker.id)).toBe(false);
    expect(feed(db).profiles).toHaveLength(PROFILES.length - 1);
  });
  it('rejects bad input', () => {
    expect(swipe(emptyDb(), 'nope', 'like').status).toBe(404);
    expect(swipe(emptyDb(), liker.id, 'superlike').status).toBe(400);
  });
  it('campus filter only returns the user\'s campus', () => {
    const { profiles } = feed(emptyDb(), { campusOnly: true });
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles.every((p) => p.place === ME.campus)).toBe(true);
  });
  it('lists shared interests', () => {
    const p = feed(emptyDb()).profiles.find((x) => x.interests.some((i) => ME.interests.includes(i)));
    expect(p.shared.length).toBeGreaterThan(0);
  });
});

describe('daily like limit', () => {
  it('blocks likes after the limit, still allows passes, resets next day', () => {
    const db = emptyDb();
    const ids = PROFILES.map((p) => p.id);
    ids.slice(0, ME.dailyLikes).forEach((id) => swipe(db, id, 'like', NOW));
    expect(swipe(db, ids[ME.dailyLikes], 'like', NOW).status).toBe(429);
    expect(swipe(db, ids[ME.dailyLikes], 'pass', NOW).match).toBe(false);
    expect(swipe(db, ids[ME.dailyLikes + 1], 'like', NOW + 86400000).likesLeft).toBe(ME.dailyLikes - 1);
  });
});

describe('undo', () => {
  it('restores a pass to the feed', () => {
    const db = emptyDb();
    swipe(db, nonLiker.id, 'pass', NOW);
    expect(undo(db).ok).toBe(true);
    expect(feed(db).profiles.some((p) => p.id === nonLiker.id)).toBe(true);
  });
  it('refuses to undo a match', () => {
    const db = emptyDb();
    swipe(db, liker.id, 'like', NOW);
    expect(undo(db).status).toBe(409);
    expect(matches(db).matches).toHaveLength(1);
  });
  it('gives a like back when undone', () => {
    const db = emptyDb();
    swipe(db, nonLiker.id, 'like', NOW);
    undo(db);
    expect(feed(db, {}, NOW).likesLeft).toBe(ME.dailyLikes);
  });
});

describe('anonymous chat and reveal', () => {
  it('only matches can chat', () => {
    const db = emptyDb();
    expect(send(db, nonLiker.id, 'hi', NOW).status).toBe(403);
    expect(thread(db, nonLiker.id, NOW).status).toBe(403);
  });
  it('delivers the reply only after its delay', () => {
    const db = emptyDb();
    swipe(db, liker.id, 'like', NOW);
    send(db, liker.id, 'hello', NOW);
    expect(thread(db, liker.id, NOW + 100).messages).toHaveLength(1);
    expect(thread(db, liker.id, NOW + 2000).messages).toHaveLength(2);
  });
  it('validates message text', () => {
    const db = emptyDb();
    swipe(db, liker.id, 'like', NOW);
    expect(send(db, liker.id, '   ').status).toBe(400);
    expect(send(db, liker.id, 'x'.repeat(501)).status).toBe(400);
  });
  it('keeps an anonymous match hidden until both reveal', () => {
    const db = emptyDb();
    swipe(db, anonLiker.id, 'like', NOW);
    expect(JSON.stringify(matches(db))).not.toContain(anonLiker.name);
    expect(reveal(db, anonLiker.id).revealed).toBe(true);
    expect(matches(db).matches[0]).toMatchObject({ name: anonLiker.name, photo: anonLiker.photo });
  });
  it('stays hidden when the other side has not revealed back', () => {
    const db = emptyDb();
    swipe(db, shyAnon.id, 'like', NOW);
    expect(reveal(db, shyAnon.id).revealed).toBe(false);
    expect(JSON.stringify(matches(db))).not.toContain(shyAnon.name);
  });
  it('cannot reveal to a non-match', () => {
    expect(reveal(emptyDb(), anonLiker.id).status).toBe(403);
  });
});
