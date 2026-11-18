import { tx } from '@/lib/db';
import { undo } from '@/lib/engine';
import { reply } from '@/lib/http';
export const dynamic = 'force-dynamic';
export const POST = () => reply(tx((db) => undo(db)));
