import { load } from '@/lib/db';
import { matches } from '@/lib/engine';
import { reply } from '@/lib/http';
export const dynamic = 'force-dynamic';
export const GET = () => reply(matches(load()));
