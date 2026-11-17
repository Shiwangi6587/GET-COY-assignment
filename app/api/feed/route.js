import { NextResponse } from 'next/server';
import { PROFILES } from '@/lib/seed';
import { load, publicProfile } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { swipes } = load();
  const profiles = PROFILES.filter((p) => !swipes[p.id]).map(publicProfile);
  return NextResponse.json({ profiles });
}
