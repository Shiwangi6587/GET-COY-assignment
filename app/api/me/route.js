import { load, tx } from '@/lib/db';
import { me } from '@/lib/engine';
import { reply, body } from '@/lib/http';
export const dynamic = 'force-dynamic';
export const GET = () => reply(me(load()));
export async function PATCH(req) {
  const { anonymous } = await body(req);
  return reply(tx((db) => { if (typeof anonymous === 'boolean') db.settings.anonymous = anonymous; return me(db); }));
}
