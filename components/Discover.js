'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Card from './Card';
import Avatar from './Avatar';
import Chat from './Chat';
import You from './You';

const call = (url, method = 'GET', body) =>
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) })
    .then(async (r) => ({ ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) }));

export default function Discover() {
  const [view, setView] = useState('swipe');
  const [chat, setChat] = useState(null);
  const [campus, setCampus] = useState(false);
  const [queue, setQueue] = useState(null);
  const [matches, setMatches] = useState([]);
  const [left, setLeft] = useState(null);
  const [popup, setPopup] = useState(null);
  const [note, setNote] = useState('');
  const top = useRef(null);
  const OUT = "You're out of likes for today. Passing is still free.";

  const load = useCallback(async () => {
    try {
      const [f, m] = await Promise.all([call(`/api/feed?campus=${campus ? 'mine' : 'all'}`), call('/api/matches')]);
      setQueue(f.data.profiles); setLeft(f.data.likesLeft); setMatches(m.data.matches);
    } catch { setNote('Could not load profiles. Check your connection and try again.'); }
  }, [campus]);
  useEffect(() => { load(); }, [load]);

  const onSwiped = async (p, action) => {
    setQueue((q) => q.filter((x) => x.id !== p.id)); // gone immediately, and the server never returns it again
    const r = await call('/api/swipe', 'POST', { profileId: p.id, action }).catch(() => null);
    if (!r?.ok) { setNote(r?.status === 429 ? OUT : 'That swipe did not save. Try again.'); load(); return; }
    setNote(''); setLeft(r.data.likesLeft);
    if (r.data.match) {
      const m = await call('/api/matches');
      setMatches(m.data.matches); setPopup(m.data.matches.find((x) => x.id === p.id));
    }
  };

  const go = (dir) => { if (dir > 0 && left === 0) return setNote(OUT); top.current?.fling(dir); };
  const undo = async () => { const r = await call('/api/undo', 'POST'); setNote(r.ok ? '' : r.data.error); if (r.ok) load(); };
  const reset = async () => { await call('/api/reset', 'POST'); setQueue(null); setNote(''); load(); };

  useEffect(() => {
    const key = (e) => { if (view === 'swipe' && !popup && !chat && e.target.tagName !== 'INPUT') { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); } };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  if (chat) return <section className="discover"><Chat id={chat} onBack={() => { setChat(null); load(); }} /></section>;

  return (
    <section className="discover">
      <header>
        <h1>Coy</h1>
        <div className="seg">
          {[['swipe', 'Swipe'], ['matches', `Matches${matches.length ? ` (${matches.length})` : ''}`], ['you', 'You']].map(([k, label]) => (
            <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{label}</button>
          ))}
        </div>
      </header>
      {note && <p className="error" role="alert">{note}</p>}

      {view === 'swipe' && (
        <>
          <div className="chips">
            <button className={!campus ? 'on' : ''} onClick={() => { setQueue(null); setCampus(false); }}>Everyone</button>
            <button className={campus ? 'on' : ''} onClick={() => { setQueue(null); setCampus(true); }}>My campus</button>
            {left !== null && <span className="likes">♥ {left} left today</span>}
          </div>
          <div className="deck">
            {queue === null && !note && <p className="muted">Finding people near you…</p>}
            {queue?.length === 0 && (
              <div className="empty">
                <h2>You're all caught up</h2>
                <p>{campus ? 'No more people from your campus right now. Try Everyone.' : "You've seen everyone for now. New people show up here as they join."}</p>
                <div className="row"><button className="ghost" onClick={undo}>Undo last swipe</button><button className="ghost" onClick={reset}>Reset demo</button></div>
              </div>
            )}
            {queue?.slice(0, 2).reverse().map((p, i, arr) => {
              const isTop = i === arr.length - 1;
              return <Card key={p.id} ref={isTop ? top : null} p={p} behind={!isTop} blockRight={left === 0} onBlocked={() => setNote(OUT)} onDone={(a) => onSwiped(p, a)} />;
            })}
          </div>
          {queue?.length > 0 && (
            <div className="actions">
              <button className="undo" aria-label="Undo last swipe" onClick={undo}>↶</button>
              <button className="pass" aria-label="Pass" onClick={() => go(-1)}>✕</button>
              <button className="like" aria-label="Like" onClick={() => go(1)}>♥</button>
            </div>
          )}
        </>
      )}

      {view === 'matches' && (matches.length === 0
        ? <div className="empty"><h2>No matches yet</h2><p>When you and someone else both like each other, they'll show up here.</p></div>
        : <ul className="list">
            {matches.map((m) => (
              <li key={m.id}>
                <button onClick={() => setChat(m.id)}>
                  <Avatar p={m} size={56} />
                  <div><b>{m.name}, {m.age}</b><span>{m.anonymous ? 'Anonymous' : m.place}{m.shared.length ? ` · ${m.shared.length} in common` : ''}</span></div>
                </button>
              </li>
            ))}
          </ul>)}

      {view === 'you' && <You onReset={reset} />}

      {popup && (
        <div className="match" role="dialog" aria-label="It's a match">
          <h2>It's a match!</h2>
          <p>You and {popup.name} liked each other.</p>
          <div className="pair"><div className="av me">You</div><Avatar p={popup} size={120} /></div>
          {popup.shared.length > 0 && <p className="common">You both like {popup.shared.join(', ')}</p>}
          <button className="primary" onClick={() => { setChat(popup.id); setPopup(null); }}>Say hi</button>
          <button className="ghost" onClick={() => setPopup(null)}>Keep swiping</button>
        </div>
      )}
    </section>
  );
}
