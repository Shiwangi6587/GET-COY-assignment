'use client';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
const THRESHOLD = 110;

const Card = forwardRef(function Card({ p, onDone, behind }, ref) {
  const [d, setD] = useState({ x: 0, y: 0, drag: false });
  const start = useRef(null);
  const gone = useRef(false);

  const fling = (dir) => {
    if (gone.current) return;
    gone.current = true;
    setD({ x: dir * 700, y: 40, drag: false });
    setTimeout(() => onDone(dir > 0 ? 'like' : 'pass'), 260);
  };
  useImperativeHandle(ref, () => ({ fling }));

  const down = (e) => { if (behind || gone.current) return; e.currentTarget.setPointerCapture(e.pointerId); start.current = { x: e.clientX, y: e.clientY }; setD((s) => ({ ...s, drag: true })); };
  const move = (e) => { if (!start.current) return; setD({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.3, drag: true }); };
  const up = () => {
    if (!start.current) return;
    start.current = null;
    if (Math.abs(d.x) > THRESHOLD) fling(Math.sign(d.x));
    else setD({ x: 0, y: 0, drag: false });
  };

  const style = behind ? undefined : {
    transform: `translate(${d.x}px, ${d.y}px) rotate(${d.x / 18}deg)`,
    transition: d.drag ? 'none' : 'transform .26s ease-out',
  };
  const pct = Math.min(1, Math.abs(d.x) / THRESHOLD);

  return (
    <article className={`card ${behind ? 'behind' : ''}`} style={style}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <img src={p.photo} alt={`${p.name}`} draggable={false} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
      <span className="stamp like" style={{ opacity: d.x > 0 ? pct : 0 }}>Like</span>
      <span className="stamp pass" style={{ opacity: d.x < 0 ? pct : 0 }}>Pass</span>
      <div className="info">
        <h2>{p.name}<span>{p.age}</span></h2>
        <p className="place">{p.place}</p>
        <p className="bio">{p.bio}</p>
        <ul>{p.interests.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
    </article>
  );
});
export default Card;
