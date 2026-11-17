import { NextResponse } from 'next/server';
import { load, save, byId } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { profileId, action } = await req.json().catch(() => ({}));
  const profile = byId(profileId);
  if (!profile) return NextResponse.json({ error: 'Unknown profile' }, { status: 404 });
  if (action !== 'like' && action !== 'pass') {
    return NextResponse.json({ error: 'action must be "like" or "pass"' }, { status: 400 });
  }
  const db = load();
  // A profile can only be swiped once; repeats return the original outcome.
  if (db.swipes[profileId]) {
    return NextResponse.json({ match: db.matches.some((m) => m.profileId === profileId), alreadySwiped: true });
  }
  db.swipes[profileId] = action;
  // A match exists only when the user likes someone who already liked them.
  const match = action === 'like' && profile.likesYou;
  if (match) db.matches.unshift({ profileId, matchedAt: Date.now() });
  save(db);
  return NextResponse.json({ match });
}
