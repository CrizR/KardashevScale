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

const MEDIA_ROOT = 'https://kardashev-calc.s3.amazonaws.com';
const INTRO_INDEX = 7;
const TRANSITION_MS = 850;

function Introduction() {
  return (
    <div className="intro-content">
      <span className="direction direction-up" aria-hidden="true">↑</span>
      <div className="civStyle intro-copy">
        <h1>Kardashev Scale</h1>
        <p>
          The Kardashev scale is a method of measuring a civilization&apos;s level of technological advancement based on the amount of energy it can use. Soviet astronomer Nikolai Kardashev proposed the scale in 1964.
        </p>
        <p>
          Scroll upward through increasingly powerful civilizations, or use the <a href="/calculator">calculator</a>.
        </p>
      </div>

      <div className="civStyle intro-copy micro-copy">
        <h1>Micro-Dimensional Mastery</h1>
        <p>
          John D. Barrow reversed the classification downward, measuring mastery over progressively smaller structures—from human-scale construction to biology, atoms, nuclei, particles, and ultimately space-time itself.
        </p>
        <a className="source-link" href="https://en.wikipedia.org/wiki/Kardashev_scale" target="_blank" rel="noreferrer">Source</a>
      </div>
      <span className="direction direction-down" aria-hidden="true">↓</span>
    </div>
  );
}

function BackgroundVideo({ src, shouldLoad, active, videoRef }) {
  return (
    <video
      ref={videoRef}
      className={`section-video${active ? ' is-active' : ''}`}
      src={shouldLoad ? src : undefined}
      muted
      loop
      playsInline
      preload={active ? 'auto' : 'metadata'}
      aria-hidden="true"
    />
  );
}

export default function LifeScale() {
  const audioRef = useRef(null);
  const videoRefs = useRef([]);
  const touchStartY = useRef(null);
  const wheelLocked = useRef(false);
  const transitionTimer = useRef(null);
  const [currentPage, setCurrentPage] = useState(INTRO_INDEX);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const sections = useMemo(() => [
    { id: 'type-6', label: 'Type VI', video: `${MEDIA_ROOT}/time.mp4`, Content: Type6 },
    { id: 'type-5', label: 'Type V', video: `${MEDIA_ROOT}/multiverse.mp4`, Content: Type5 },
    { id: 'type-4', label: 'Type IV', video: `${MEDIA_ROOT}/deep.mp4`, Content: Type4 },
    { id: 'type-3', label: 'Type III', video: `${MEDIA_ROOT}/galaxies.mp4`, Content: Type3 },
    { id: 'type-2', label: 'Type II', video: `${MEDIA_ROOT}/star.mp4`, Content: Type2 },
    { id: 'type-1', label: 'Type I', video: `${MEDIA_ROOT}/planets.mp4`, Content: Type1 },
    { id: 'type-0', label: 'Type 0', video: `${MEDIA_ROOT}/earth.mp4`, Content: Type0 },
    { id: 'introduction', label: 'Introduction', video: `${MEDIA_ROOT}/base.mp4`, Content: Introduction },
    { id: 'type-i-minus', label: 'Type I−', video: `${MEDIA_ROOT}/skylinep.mp4`, Content: TypeI },
    { id: 'type-ii-minus', label: 'Type II−', video: `${MEDIA_ROOT}/crispr.mp4`, Content: TypeII },
    { id: 'type-iii-minus', label: 'Type III−', video: `${MEDIA_ROOT}/galaxy.mp4`, Content: TypeIII },
    { id: 'type-iv-minus', label: 'Type IV−', video: `${MEDIA_ROOT}/atomboy.mp4`, Content: TypeIV },
    { id: 'type-v-minus', label: 'Type V−', video: `${MEDIA_ROOT}/galaxy.mp4`, Content: TypeV },
    { id: 'type-vi-minus', label: 'Type VI−', video: `${MEDIA_ROOT}/galaxy.mp4`, Content: TypeVI },
    { id: 'type-omega-minus', label: 'Type Ω−', video: `${MEDIA_ROOT}/galaxy.mp4`, Content: TypeO },
  ], []);

  const goToPage = useCallback((nextPage) => {
    const next = Math.max(0, Math.min(sections.length - 1, nextPage));
    if (next === currentPage || isTransitioning) return;

    setIsTransitioning(true);
    setCurrentPage(next);
    window.sessionStorage.setItem('kardashev-page', String(next));

    window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
  }, [currentPage, isTransitioning, sections.length]);

  const move = useCallback((offset) => {
    goToPage(currentPage + offset);
  }, [currentPage, goToPage]);

  useEffect(() => {
    const savedPage = Number.parseInt(window.sessionStorage.getItem('kardashev-page') || '', 10);
    if (Number.isInteger(savedPage) && savedPage >= 0 && savedPage < sections.length) {
      setCurrentPage(savedPage);
    }
    return () => window.clearTimeout(transitionTimer.current);
  }, [sections.length]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentPage) {
        const playAttempt = video.play();
        if (playAttempt?.catch) playAttempt.catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        move(-1);
      }
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        move(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleWheel = (event) => {
    event.preventDefault();
    if (wheelLocked.current || Math.abs(event.deltaY) < 18) return;
    wheelLocked.current = true;
    move(event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => { wheelLocked.current = false; }, TRANSITION_MS);
  };

  const handleTouchStart = (event) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartY.current === null) return;
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const delta = touchStartY.current - endY;
    touchStartY.current = null;
    if (Math.abs(delta) < 46) return;
    move(delta > 0 ? 1 : -1);
  };

  const toggleSound = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundEnabled) {
      audio.pause();
      setSoundEnabled(false);
      return;
    }

    try {
      audio.volume = 0.72;
      await audio.play();
      setSoundEnabled(true);
    } catch {
      setSoundEnabled(false);
    }
  };

  return (
    <main className={`scale-shell${isTransitioning ? ' is-transitioning' : ''}`}>
      <audio ref={audioRef} src={music} loop preload="metadata" />

      <div className="scale-status" aria-live="polite">
        <span>{String(currentPage + 1).padStart(2, '0')} / {sections.length}</span>
        <strong>{sections[currentPage].label}</strong>
      </div>

      <button className={`sound-control${soundEnabled ? ' is-on' : ''}`} type="button" onClick={toggleSound}>
        {soundEnabled ? 'Sound on' : 'Enable sound'}
      </button>

      <div className="scale-controls">
        <button type="button" onClick={() => move(-1)} disabled={currentPage === 0} aria-label="Previous civilization type">↑</button>
        <button type="button" onClick={() => move(1)} disabled={currentPage === sections.length - 1} aria-label="Next civilization type">↓</button>
      </div>

      <div
        className="cinematic-viewport"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="cinematic-track"
          style={{ transform: `translate3d(0, -${currentPage * 100}dvh, 0)` }}
        >
          {sections.map(({ id, video, Content }, index) => {
            const shouldLoad = Math.abs(index - currentPage) <= 1;
            const active = index === currentPage;
            return (
              <section
                className={`scale-section section-${index}${active ? ' is-active' : ''}`}
                id={id}
                key={id}
                aria-hidden={!active}
              >
                <BackgroundVideo
                  src={video}
                  shouldLoad={shouldLoad}
                  active={active}
                  videoRef={(element) => { videoRefs.current[index] = element; }}
                />
                <div className="video-vignette" />
                <div className="section-content">
                  <Content />
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="transition-flare" aria-hidden="true" />
    </main>
  );
}
