import { load } from '@/lib/db';
import { feed } from '@/lib/engine';
import { reply } from '@/lib/http';
export const dynamic = 'force-dynamic';
export const GET = (req) => reply(feed(load(), { campusOnly: new URL(req.url).searchParams.get('campus') === 'mine' }));
