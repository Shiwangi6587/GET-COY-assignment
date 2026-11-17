'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Card from './Card';

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());

export default function Discover() {
  const [view, setView] = useState('swipe');
  const [queue, setQueue] = useState(null);
  const [matches, setMatches] = useState([]);
  const [popup, setPopup] = useState(null);
  const [error, setError] = useState('');
  const top = useRef(null);

  const load = useCallback(async () => {
    try {
      const [f, m] = await Promise.all([fetch('/feed').then((r) => r.json()), fetch('/matches').then((r) => r.json())]);
      setQueue(f.profiles); setMatches(m.matches); setError('');
    } catch { setError('Could not load profiles. Check your connection and try again.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const onSwiped = async (profile, action) => {
    setQueue((q) => q.filter((p) => p.id !== profile.id)); // removed immediately, never shown again
    try {
      const { match } = await post('/swipe', { profileId: profile.id, action });
      if (match) { setPopup(profile); setMatches((m) => [{ ...profile, matchedAt: Date.now() }, ...m]); }
    } catch { setError('Your last swipe may not have saved. Reload to check.'); }
  };

  useEffect(() => {
    const key = (e) => { if (view === 'swipe' && !popup) { if (e.key === 'ArrowRight') top.current?.fling(1); if (e.key === 'ArrowLeft') top.current?.fling(-1); } };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [view, popup]);

  const reset = async () => { await post('/api/reset', {}); setQueue(null); load(); };

  return (
    <section className="discover">
      <header>
        <h1>Coy</h1>
        <div className="seg">
          <button className={view === 'swipe' ? 'on' : ''} onClick={() => setView('swipe')}>Swipe</button>
          <button className={view === 'matches' ? 'on' : ''} onClick={() => setView('matches')}>Matches{matches.length ? ` (${matches.length})` : ''}</button>
        </div>
      </header>
      {error && <p className="error" role="alert">{error}</p>}

      {view === 'swipe' && (
        <>
          <div className="deck">
            {queue === null && !error && <p className="muted">Finding people near you…</p>}
            {queue?.length === 0 && (
              <div className="empty">
                <h2>You're all caught up</h2>
                <p>You've seen everyone for now. New people show up here as they join.</p>
                <button className="ghost" onClick={reset}>Reset demo</button>
              </div>
            )}
            {queue?.slice(0, 2).reverse().map((p, i, arr) => {
              const isTop = i === arr.length - 1;
              return <Card key={p.id} ref={isTop ? top : null} p={p} behind={!isTop} onDone={(a) => onSwiped(p, a)} />;
            })}
          </div>
          {queue?.length > 0 && (
            <div className="actions">
              <button className="pass" aria-label="Pass" onClick={() => top.current?.fling(-1)}>✕</button>
              <button className="like" aria-label="Like" onClick={() => top.current?.fling(1)}>♥</button>
            </div>
          )}
        </>
      )}

      {view === 'matches' && (
        matches.length === 0 ? (
          <div className="empty"><h2>No matches yet</h2><p>When you and someone else both like each other, they'll show up here.</p></div>
        ) : (
          <ul className="grid">
            {matches.map((m) => (
              <li key={m.id}><img src={m.photo} alt="" /><div><b>{m.name}, {m.age}</b><span>{m.place}</span></div></li>
            ))}
          </ul>
        )
      )}

      {popup && (
        <div className="match" role="dialog" aria-label="It's a match">
          <h2>It's a match!</h2>
          <p>You and {popup.name} liked each other.</p>
          <div className="pair"><div className="me">You</div><img src={popup.photo} alt={popup.name} /></div>
          <button className="primary" onClick={() => setPopup(null)}>Keep swiping</button>
          <button className="ghost" onClick={() => { setPopup(null); setView('matches'); }}>View matches</button>
        </div>
      )}
    </section>
  );
}
