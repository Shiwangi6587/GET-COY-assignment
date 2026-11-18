import { describe, it, expect, beforeAll } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { PROFILES } from '@/lib/seed';

let feed, swipe, matches;
const req = (b) => new Request('http://t/api/swipe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });

beforeAll(async () => {
  process.env.COY_DB = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'coy-')), 'db.json');
  feed = await import('@/app/api/feed/route');
  swipe = await import('@/app/api/swipe/route');
  matches = await import('@/app/api/matches/route');
});

describe('HTTP routes', () => {
  it('feed leaks no private fields', async () => {
    const text = await (await feed.GET(new Request('http://t/api/feed'))).text();
    expect(text).not.toContain('likesYou');
    expect(text).not.toContain('willReveal');
  });
  it('two simultaneous likes create one match', async () => {
    const liker = PROFILES.find((p) => p.likesYou && !p.anonymous);
    await Promise.all([swipe.POST(req({ profileId: liker.id, action: 'like' })), swipe.POST(req({ profileId: liker.id, action: 'like' }))]);
    const { matches: list } = await (await matches.GET()).json();
    expect(list.filter((m) => m.id === liker.id)).toHaveLength(1);
  });
  it('returns 400 for a bad swipe and 404 for an unknown profile', async () => {
    expect((await swipe.POST(req({ profileId: 'p3', action: 'nope' }))).status).toBe(400);
    expect((await swipe.POST(req({ profileId: 'zzz', action: 'like' }))).status).toBe(404);
  });
});
