// Real photo when identity is visible; otherwise a colour wash derived from the profile id.
export const wash = (id) => { const h = (parseInt(id.slice(1), 10) * 47) % 360; return `linear-gradient(145deg,hsl(${h} 60% 58%),hsl(${(h + 55) % 360} 60% 34%))`; };
export default function Avatar({ p, size = 56 }) {
  const s = { width: size, height: size };
  return p.photo
    ? <img className="av" style={s} src={p.photo} alt="" />
    : <div className="av anon" style={{ ...s, background: wash(p.id), fontSize: size / 2.4 }} aria-label="Anonymous">?</div>;
}
