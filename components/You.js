'use client';
import { useEffect, useState } from 'react';

export default function You({ onReset }) {
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { fetch('/api/me').then((r) => r.json()).then(setMe); }, []);
  if (!me) return <p className="muted pad">Loading…</p>;
  const anon = me.settings.anonymous;

  const toggle = async () => {
    const r = await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anonymous: !anon }) });
    setMe(await r.json());
  };
  const share = async () => {
    const text = 'Send your crush an anonymous message on Coy.';
    try {
      if (navigator.share) await navigator.share({ title: 'Coy', text, url: location.origin });
      else { await navigator.clipboard.writeText(`${text} ${location.origin}`); setMsg('Invite link copied.'); }
    } catch { /* share sheet dismissed */ }
  };

  return (
    <div className="you">
      <h2>How others see you</h2>
      <label className="switch">
        <input type="checkbox" checked={!anon} onChange={toggle} />
        <span>Show my name and photo</span>
      </label>
      <p className="muted">{anon ? `You appear as "${me.codename}". Your name and photo stay hidden until you both reveal.` : 'Your name and photo are visible on your card.'}</p>
      <h2>Your campus</h2>
      <p className="muted">{me.campus}. Use "My campus" on the Swipe tab to see only people from here.</p>
      <h2>Likes today</h2>
      <p className="muted">{me.likesLeft} left. Passing is always free.</p>
      <div className="row">
        <button className="primary" onClick={share}>Invite a friend</button>
        <button className="ghost" onClick={onReset}>Reset demo</button>
      </div>
      {msg && <p className="muted" role="status">{msg}</p>}
    </div>
  );
}
