import { NextResponse } from 'next/server';
export const reply = (r) => (r?.error ? NextResponse.json({ error: r.error }, { status: r.status }) : NextResponse.json(r));
export const body = (req) => req.json().catch(() => ({}));
