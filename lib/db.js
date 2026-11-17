import fs from 'fs';
import path from 'path';
import { PROFILES } from './seed';

const FILE = process.env.VERCEL ? '/tmp/coy-db.json' : path.join(process.cwd(), 'data', 'db.json');

export function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return { swipes: {}, matches: [] }; }
}
export function save(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE + '.tmp', JSON.stringify(db));
  fs.renameSync(FILE + '.tmp', FILE);
}
export const byId = (id) => PROFILES.find((p) => p.id === id);
// Strips the private "likesYou" flag so likes are never revealed before a match.
export const publicProfile = ({ likesYou, ...rest }) => rest;
