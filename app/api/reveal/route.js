import { tx } from '@/lib/db';
import { reveal } from '@/lib/engine';
import { reply, body } from '@/lib/http';
export const dynamic = 'force-dynamic';
export async function POST(req) { const { profileId } = await body(req); return reply(tx((db) => reveal(db, profileId))); }
