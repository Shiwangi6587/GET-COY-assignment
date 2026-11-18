import { tx } from '@/lib/db';
import { swipe } from '@/lib/engine';
import { reply, body } from '@/lib/http';
export const dynamic = 'force-dynamic';
export async function POST(req) { const { profileId, action } = await body(req); return reply(tx((db) => swipe(db, profileId, action))); }
