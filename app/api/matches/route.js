import { NextResponse } from 'next/server';
import { load, byId, publicProfile } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { matches } = load();
  return NextResponse.json({
    matches: matches.map((m) => ({ ...publicProfile(byId(m.profileId)), matchedAt: m.matchedAt })),
  });
}
