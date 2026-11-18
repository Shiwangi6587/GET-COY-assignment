import { load, tx } from '@/lib/db';
import { thread, send } from '@/lib/engine';
import { reply, body } from '@/lib/http';
export const dynamic = 'force-dynamic';
export const GET = (req) => reply(thread(load(), new URL(req.url).searchParams.get('profileId')));
export async function POST(req) { const { profileId, text } = await body(req); return reply(tx((db) => send(db, profileId, text))); }
