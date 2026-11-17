import { NextResponse } from 'next/server';
import { save } from '@/lib/db';
export const dynamic = 'force-dynamic';

// Demo helper: clears all swipes and matches.
export async function POST() {
  save({ swipes: {}, matches: [] });
  return NextResponse.json({ ok: true });
}
