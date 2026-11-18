import fs from 'fs';
import path from 'path';
import { emptyDb } from './engine';

const FILE = process.env.COY_DB || (process.env.VERCEL ? '/tmp/coy-db.json' : path.join(process.cwd(), 'data', 'db.json'));

export function load() {
  try { return { ...emptyDb(), ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }; }
  catch { return emptyDb(); }
}
export function save(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE + '.tmp', JSON.stringify(db));
  fs.renameSync(FILE + '.tmp', FILE);
}
// Load, mutate and save in one synchronous step, so concurrent requests can't interleave.
export const tx = (fn) => { const db = load(); const r = fn(db); save(db); return r; };
