'use client';
import { useState } from 'react';
import Discover from '@/components/Discover';

export default function App() {
  const [tab, setTab] = useState('discover');
  return (
    <div className="app">
      <main className="screen">
        {tab === 'home' ? <div aria-label="Home" /> : <Discover />}
      </main>
      <nav className="tabbar" role="tablist">
        {['home', 'discover'].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t === 'home' ? 'Home' : 'Discover'}
          </button>
        ))}
      </nav>
    </div>
  );
}
