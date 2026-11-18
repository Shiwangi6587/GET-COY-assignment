import { save } from '@/lib/db';
import { emptyDb } from '@/lib/engine';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
// Demo helper: clears swipes, matches, chats and reveals.
export const POST = () => { save(emptyDb()); return NextResponse.json({ ok: true }); };
