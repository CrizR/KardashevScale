import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import music from '../../music.mp3';
import Type0 from '../CivTypes/Type0';
import Type1 from '../CivTypes/Type1';
import Type2 from '../CivTypes/Type2';
import Type3 from '../CivTypes/Type3';
import Type4 from '../CivTypes/Type4';
import Type5 from '../CivTypes/Type5';
import Type6 from '../CivTypes/Type6';
import TypeO from '../MicroMaster/Type-O';
import TypeVI from '../MicroMaster/Type-VI';
import TypeV from '../MicroMaster/Type-V';
import TypeIV from '../MicroMaster/Type-IV';
import TypeIII from '../MicroMaster/Type-III';
import TypeII from '../MicroMaster/Type-II';
import TypeI from '../MicroMaster/Type-I';
import ScaleWorld from './ScaleWorld';
import { SCALE_SECTIONS, clampProgress, getSectionIndexFromLocation } from './scaleConfig';
import './ThreeScale.css';

const CONTENT = [Type6, Type5, Type4, Type3, Type2, Type1, Type0, Introduction, TypeI, TypeII, TypeIII, TypeIV, TypeV, TypeVI, TypeO];
const SOUND_KEY = 'kardashev-sound-preference';
const WHEEL_SCALE = 0.00072;
const MAX_WHEEL_STEP = 0.075;
const DRAG_SCALE = 0.78;

function Introduction() {
  return (
    <div className="intro-content">
      <div className="civStyle intro-copy">
        <h1>Kardashev Scale</h1>
        <p>The Kardashev scale measures technological advancement through the amount of energy a civilization can use. Nikolai Kardashev proposed the original planetary, stellar, and galactic levels in 1964.</p>
      </div>
      <div className="civStyle intro-copy micro-copy">
        <h1>Micro-Dimensional Mastery</h1>
        <p>John D. Barrow reversed the journey. His scale moves downward from human-scale construction through biology, molecules, atoms, nuclei, particles, and ultimately spacetime itself.</p>
      </div>
    </div>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export default function LifeScale() {
  const reducedMotion = useReducedMotion();
  const audioRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef(null);
  const wheel = useRef(0);
  const wheelReset = useRef(null);
  const saveTimer = useRef(null);
  const controlsTimer = useRef(null);
  const previousProgress = useRef(getSectionIndexFromLocation());

  const [progress, setProgress] = useState(getSectionIndexFromLocation);
  const [detailsVisible, setDetailsVisible] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(() => window.sessionStorage.getItem('kardashev-r3f-entered') !== 'yes');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [worldReady, setWorldReady] = useState(false);
  const [worldError, setWorldError] = useState(false);
  const [boundary, setBoundary] = useState(false);

  const currentIndex = Math.max(0, Math.min(SCALE_SECTIONS.length - 1, Math.round(progress)));
  const current = SCALE_SECTIONS[currentIndex];
  const CurrentContent = CONTENT[currentIndex];
  const localProgress = progress - currentIndex;

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(controlsTimer.current);
    if (immersive && !mapOpen && !entryOpen) controlsTimer.current = window.setTimeout(() => setControlsVisible(false), 2300);
  }, [entryOpen, immersive, mapOpen]);

  const updateProgress = useCallback((next) => {
    const clamped = clampProgress(next);
    const crossed = (previousProgress.current >= 2.5 && clamped < 2.5) || (previousProgress.current < 2.5 && clamped >= 2.5);
    previousProgress.current = clamped;
    setProgress(clamped);
    if (crossed) {
      setBoundary(true);
      window.setTimeout(() => setBoundary(false), reducedMotion ? 900 : 1800);
    }
    revealControls();
  }, [reducedMotion, revealControls]);

  const goTo = useCallback((index) => {
    updateProgress(index);
    setMapOpen(false);
  }, [updateProgress]);

  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      window.sessionStorage.setItem('kardashev-progress', String(progress));
      window.history.replaceState(null, '', `/#${current.id}`);
    }, 180);
    return () => window.clearTimeout(saveTimer.current);
  }, [current.id, progress]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      revealControls();
      if (event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); goTo(currentIndex - 1); }
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') { event.preventDefault(); goTo(currentIndex + 1); }
      if (event.key.toLowerCase() === 'l') setDetailsVisible((value) => !value);
      if (event.key === 'Escape') setMapOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, goTo, revealControls]);

  useEffect(() => () => {
    window.clearTimeout(controlsTimer.current);
    window.clearTimeout(saveTimer.current);
    window.clearTimeout(wheelReset.current);
  }, []);

  const startSound = async () => {
    try {
      await audioRef.current?.play();
      setSoundEnabled(true);
      window.localStorage.setItem(SOUND_KEY, 'on');
      return true;
    } catch {
      setSoundEnabled(false);
      return false;
    }
  };

  const enter = async (mode) => {
    if (mode !== 'muted') await startSound();
    if (mode === 'immersive') {
      setImmersive(true);
      setDetailsVisible(false);
      await document.documentElement.requestFullscreen?.().catch(() => undefined);
      navigator.wakeLock?.request('screen').catch(() => undefined);
    }
    window.sessionStorage.setItem('kardashev-r3f-entered', 'yes');
    setEntryOpen(false);
    revealControls();
  };

  const toggleSound = async () => {
    if (soundEnabled) {
      audioRef.current?.pause();
      setSoundEnabled(false);
      window.localStorage.setItem(SOUND_KEY, 'off');
    } else {
      await startSound();
    }
    revealControls();
  };

  const toggleImmersive = async () => {
    if (immersive) {
      setImmersive(false);
      setDetailsVisible(true);
      if (document.fullscreenElement) await document.exitFullscreen?.().catch(() => undefined);
    } else {
      setImmersive(true);
      setDetailsVisible(false);
      await document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
    revealControls();
  };

  const contentCanConsumeWheel = (event) => {
    const panel = event.target.closest?.('.three-copy');
    if (!panel || panel.scrollHeight <= panel.clientHeight + 2) return false;
    const atTop = panel.scrollTop <= 1;
    const atBottom = panel.scrollTop >= panel.scrollHeight - panel.clientHeight - 1;
    return (event.deltaY < 0 && !atTop) || (event.deltaY > 0 && !atBottom);
  };

  const onWheel = (event) => {
    if (entryOpen || mapOpen) return;
    if (contentCanConsumeWheel(event)) return;
    event.preventDefault();

    const normalized = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 120);
    wheel.current = THREEClamp(wheel.current + normalized * WHEEL_SCALE, -MAX_WHEEL_STEP, MAX_WHEEL_STEP);
    updateProgress(progress + wheel.current);

    window.clearTimeout(wheelReset.current);
    wheelReset.current = window.setTimeout(() => { wheel.current = 0; }, 90);
  };

  const onPointerDown = (event) => {
    if (event.target.closest?.('button, a, aside')) return;
    const panel = event.target.closest?.('.three-copy');
    const scrollableContent = Boolean(panel && panel.scrollHeight > panel.clientHeight + 2);
    drag.current = { id: event.pointerId, y: event.clientY, progress, panel, scrollableContent };
    if (!scrollableContent) event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    pointer.current.x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    pointer.current.y = -(event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    revealControls();
    if (!drag.current || drag.current.id !== event.pointerId) return;

    if (drag.current.scrollableContent) {
      const deltaY = drag.current.y - event.clientY;
      const panel = drag.current.panel;
      const atTop = panel.scrollTop <= 1;
      const atBottom = panel.scrollTop >= panel.scrollHeight - panel.clientHeight - 1;
      const leavingAtTop = deltaY < -18 && atTop;
      const leavingAtBottom = deltaY > 18 && atBottom;
      if (!leavingAtTop && !leavingAtBottom) return;
      drag.current = { ...drag.current, y: event.clientY, progress, scrollableContent: false };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      return;
    }

    const delta = (drag.current.y - event.clientY) / Math.max(window.innerHeight, 1) * DRAG_SCALE;
    updateProgress(drag.current.progress + delta);
  };

  const onPointerUp = (event) => {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    const wasContentScroll = drag.current.scrollableContent;
    drag.current = null;
    if (!wasContentScroll) goTo(Math.round(progress));
  };

  const style = useMemo(() => ({ '--section-accent': current.accent, '--section-progress': localProgress }), [current.accent, localProgress]);

  return (
    <main className={`three-scale realm-${current.realm}${immersive ? ' is-immersive' : ''}${controlsVisible || mapOpen || entryOpen ? ' is-ui-visible' : ' is-ui-hidden'}${detailsVisible ? ' is-learning' : ' is-experiencing'}`} style={style} onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <audio ref={audioRef} src={music} loop preload="auto" />
      <ScaleWorld progress={progress} pointer={pointer} reducedMotion={reducedMotion} onReady={() => setWorldReady(true)} onError={() => setWorldError(true)} />
      <div className="three-world-shade" />

      {!worldReady && !worldError && <div className="world-loader"><span /><p>Building the continuous universe.</p></div>}
      {worldError && <div className="world-loader world-error"><p>WebGL stopped responding. Reload the page or continue with hardware acceleration enabled.</p></div>}

      {boundary && <div className="original-boundary"><span>Beyond Kardashev’s original proposal</span><h2>The original scale ends at Type III.</h2><p>Types IV through VI are speculative extensions.</p></div>}

      <section className={`three-copy${detailsVisible ? ' show-details' : ''}`} aria-live="polite">
        <div className="three-copy-meta"><span>{current.classification}</span><strong>{current.scaleLabel}</strong></div>
        <div key={current.id} className="three-copy-content"><CurrentContent /></div>
        <p className="three-comparison"><span>What changes at this scale</span>{current.comparison}</p>
      </section>

      <div className="three-interface">
        <button type="button" className="three-status" onClick={() => setMapOpen(true)}><span>{String(currentIndex + 1).padStart(2, '0')} / {SCALE_SECTIONS.length}</span><strong>{current.label}</strong><small>{current.group}</small></button>
        <div className="three-top-actions"><button type="button" onClick={toggleSound}>{soundEnabled ? 'Sound on' : 'Sound off'}</button><button type="button" onClick={toggleImmersive}>{immersive ? 'Exit immersive' : 'Immersive'}</button></div>
        <div className="three-bottom-actions"><button type="button" onClick={() => setDetailsVisible((value) => !value)}>{detailsVisible ? 'Hide details' : 'Learn'}</button><button type="button" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>↑</button><button type="button" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === SCALE_SECTIONS.length - 1}>↓</button></div>
        <nav className="three-rail" aria-label="Scale position">{SCALE_SECTIONS.map((section, index) => <button type="button" key={section.id} className={index === currentIndex ? 'current' : ''} style={{ top: `${(index / (SCALE_SECTIONS.length - 1)) * 100}%` }} onClick={() => goTo(index)} aria-label={`Go to ${section.label}`}><span /></button>)}</nav>
      </div>

      {mapOpen && <button className="scale-map-backdrop" type="button" onClick={() => setMapOpen(false)} aria-label="Close navigator" />}
      <aside className={`scale-map${mapOpen ? ' is-open' : ''}`} aria-hidden={!mapOpen}><div className="scale-map-header"><div><span>Continuous journey</span><h2>The complete scale</h2></div><button type="button" onClick={() => setMapOpen(false)}>×</button></div><div className="scale-map-list">{SCALE_SECTIONS.map((section, index) => <button type="button" key={section.id} className={index === currentIndex ? 'is-current' : ''} onClick={() => goTo(index)}><span className="scale-map-dot is-ready" /><strong>{section.label}</strong><small>{section.group}</small></button>)}</div><a className="scale-map-calculator" href="/calculator">Open the calculator →</a></aside>

      {entryOpen && <div className="three-entry"><div className="three-entry-copy"><p>One continuous real-time universe.</p><h1>Travel through the Kardashev Scale</h1><span>Every level is rendered as its own authored 3D environment. Scroll outward toward cosmic engineering or inward toward the structure of spacetime.</span><div><button type="button" className="primary" onClick={() => enter('immersive')}>Enter immersive</button><button type="button" onClick={() => enter('sound')}>Enter with sound</button><button type="button" onClick={() => enter('muted')}>Continue muted</button></div></div></div>}
    </main>
  );
}

function THREEClamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
