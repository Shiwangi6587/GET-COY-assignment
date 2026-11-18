'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';

const call = (url, body) => fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);

export default function Chat({ id, onBack }) {
  const [d, setD] = useState(null);
  const [text, setText] = useState('');
  const end = useRef(null);

  const pull = useCallback(async () => { const r = await call(`/api/messages?profileId=${id}`); if (r.ok) setD(await r.json()); }, [id]);
  useEffect(() => { pull(); const t = setInterval(pull, 2000); return () => clearInterval(t); }, [pull]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [d?.messages.length]);

  if (!d) return <div className="chat"><p className="muted pad">Opening chat…</p></div>;
  const p = d.profile;
  const send = async (e) => { e.preventDefault(); const t = text.trim(); if (!t) return; setText(''); await call('/api/messages', { profileId: id, text: t }); pull(); };
  const doReveal = async () => { await call('/api/reveal', { profileId: id }); pull(); };

  return (
    <div className="chat">
      <div className="chathead">
        <button onClick={onBack} aria-label="Back to matches">‹</button>
        <Avatar p={p} size={40} />
        <div><b>{p.name}</b><span>{p.anonymous ? 'Anonymous until you both reveal' : p.place}</span></div>
      </div>
      {p.anonProfile && (
        <div className="banner">
          {!p.anonymous && 'Identities revealed.'}
          {p.anonymous && !p.youRevealed && (<>Names and photos appear only when you both reveal. <button onClick={doReveal}>Reveal my identity</button></>)}
          {p.anonymous && p.youRevealed && `You've asked to reveal. We'll show you both as soon as ${p.name} does too.`}
        </div>
      )}
      <div className="msgs">
        {d.messages.length === 0 && <p className="muted pad">Say hi to {p.name}. You have {p.shared.length || 'a few'} things in common{p.shared.length ? `: ${p.shared.join(', ')}` : ''}.</p>}
        {d.messages.map((m, i) => <p key={i} className={`bubble ${m.from}`}>{m.text}</p>)}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="composer">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" maxLength={500} aria-label="Message" />
        <button className="primary" disabled={!text.trim()}>Send</button>
      </form>
    </div>
  );
}
