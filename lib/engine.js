// All Coy rules live here as plain functions over a db object, so they are easy to unit test.
import { PROFILES } from './seed';

export const ME = {
  campus: 'IGDTUW, Delhi',
  interests: ['Coding', 'Travel', 'Music', 'Coffee', 'Hiking', 'Books'],
  codename: 'Velvet Lantern',
  dailyLikes: 15,
};
export const emptyDb = () => ({ swipes: {}, matches: [], reveals: {}, messages: {}, history: [], likes: {}, settings: { anonymous: false } });

const fail = (status, error) => ({ error, status });
const day = (now) => new Date(now).toISOString().slice(0, 10);
const get = (id) => PROFILES.find((p) => p.id === id);
const isMatch = (db, id) => db.matches.some((m) => m.profileId === id);
const isRevealed = (db, p) => !p.anonymous || (!!db.reveals[p.id] && p.willReveal);

export const likesLeft = (db, now = Date.now()) => Math.max(0, ME.dailyLikes - (db.likes[day(now)] || 0));

// The ONLY shape in which a profile leaves the server. Hidden identities get a codename and no photo.
export function view(db, p) {
  const hidden = !isRevealed(db, p);
  return {
    id: p.id, name: hidden ? p.codename : p.name, age: p.age, photo: hidden ? null : p.photo,
    anonymous: hidden, anonProfile: p.anonymous, youRevealed: !!db.reveals[p.id],
    bio: p.bio, place: p.place, interests: p.interests,
    shared: p.interests.filter((i) => ME.interests.includes(i)),
  };
}

export function feed(db, { campusOnly = false } = {}, now = Date.now()) {
  const profiles = PROFILES.filter((p) => !db.swipes[p.id] && (!campusOnly || p.place === ME.campus)).map((p) => view(db, p));
  return { profiles, likesLeft: likesLeft(db, now) };
}

export function swipe(db, profileId, action, now = Date.now()) {
  const p = get(profileId);
  if (!p) return fail(404, 'Unknown profile');
  if (action !== 'like' && action !== 'pass') return fail(400, 'action must be "like" or "pass"');
  // A profile can be swiped once; repeats return the original outcome and change nothing.
  if (db.swipes[profileId]) return { match: isMatch(db, profileId), likesLeft: likesLeft(db, now), alreadySwiped: true };
  if (action === 'like' && likesLeft(db, now) === 0) return fail(429, 'No likes left today. Passing is still free.');
  db.swipes[profileId] = action;
  // A match exists only when the user likes someone who already liked them.
  const match = action === 'like' && p.likesYou;
  if (action === 'like') db.likes[day(now)] = (db.likes[day(now)] || 0) + 1;
  if (match) db.matches.unshift({ profileId, matchedAt: now });
  db.history.push({ profileId, action, match, day: day(now) });
  // Same response shape for every swipe, so nothing else varies with whether they liked you.
  return { match, likesLeft: likesLeft(db, now) };
}

export function undo(db) {
  const last = db.history[db.history.length - 1];
  if (!last) return fail(404, 'Nothing to undo');
  if (last.match) return fail(409, "Matches can't be undone");
  db.history.pop();
  delete db.swipes[last.profileId];
  if (last.action === 'like') db.likes[last.day] = Math.max(0, (db.likes[last.day] || 1) - 1);
  return { ok: true, profileId: last.profileId };
}

export function matches(db) {
  return { matches: db.matches.map((m) => ({ ...view(db, get(m.profileId)), matchedAt: m.matchedAt })) };
}

const REPLIES = ['Hey! Glad we matched 🙂', 'So what are you into these days?', 'Ha, okay, that is a fair answer.', 'Coffee person or chai person? Choose carefully.', 'Tell me one thing most people get wrong about you.', 'That sounds fun. Tell me more.', 'I like where this is going.', 'Okay, you have my attention.'];

export function thread(db, id, now = Date.now()) {
  const p = get(id);
  if (!p) return fail(404, 'Unknown profile');
  if (!isMatch(db, id)) return fail(403, 'You can only chat with matches');
  return { profile: view(db, p), messages: (db.messages[id] || []).filter((m) => m.at <= now) };
}

export function send(db, id, text, now = Date.now()) {
  const p = get(id);
  if (!p) return fail(404, 'Unknown profile');
  if (!isMatch(db, id)) return fail(403, 'You can only message matches');
  const t = String(text ?? '').trim();
  if (!t || t.length > 500) return fail(400, 'Message must be 1 to 500 characters');
  const list = (db.messages[id] ||= []);
  list.push({ from: 'me', text: t, at: now });
  // Simulated reply, delivered 1.5s later (the thread hides messages that are not due yet).
  list.push({ from: 'them', text: REPLIES[(list.length + PROFILES.indexOf(p)) % REPLIES.length], at: now + 1500 });
  return { ok: true };
}

export function reveal(db, id) {
  const p = get(id);
  if (!p) return fail(404, 'Unknown profile');
  if (!isMatch(db, id)) return fail(403, 'You can only reveal to matches');
  // Identities appear only when BOTH sides have revealed.
  if (p.anonymous) db.reveals[id] = true;
  return { revealed: isRevealed(db, p) };
}

export function me(db, now = Date.now()) {
  return { settings: db.settings, campus: ME.campus, interests: ME.interests, codename: ME.codename, likesLeft: likesLeft(db, now) };
}
