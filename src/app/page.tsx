'use client';

import ThreeScene from '@/components/ThreeScene';
import { useState } from 'react';
import * as React from 'react';

export default function Home() {
  const [currentView, setCurrentView] = useState(0);
  
  const views = [
    'Overview',
    'Manifesto',
    'Projects', 
    'Accomplishments',
    'Work History',
    'Thanks',
    'Moon'
  ];

  interface WindowWithNav extends Window {
    navigateToView?: (index: number) => void;
  }

  const navigateToView = (index: number) => {
    setCurrentView(index);
    const win = window as WindowWithNav;
    if (win.navigateToView) {
      win.navigateToView(index);
    }
  };

  const nextView = () => {
    const next = (currentView + 1) % views.length;
    navigateToView(next);
  };

  const prevView = () => {
    const prev = (currentView - 1 + views.length) % views.length;
    navigateToView(prev);
  };

  return (
    <>
      <ThreeScene />
      <main>
        <div className="nav-controls">
          <button onClick={prevView} className="nav-btn">
            ← Prev
          </button>
          <div className="view-indicator">
            <span>{views[currentView]}</span>
            <div className="dots">
              {views.map((_, i) => (
                <span 
                  key={i} 
                  className={`dot ${i === currentView ? 'active' : ''}`}
                  onClick={() => navigateToView(i)}
                />
              ))}
            </div>
          </div>
          <button onClick={nextView} className="nav-btn">
            Next →
          </button>
        </div>
        <div className="hint-text">
          <p>🖱️ Drag & Scroll to Explore</p>
        </div>
      </main>
    </>
  );
}
