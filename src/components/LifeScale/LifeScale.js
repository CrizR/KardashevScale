import React, { useEffect, useMemo, useRef, useState } from 'react';
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

function Introduction() {
  return (
    <div className="intro-content">
      <span className="direction" aria-hidden="true">↑</span>
      <div className="civStyle intro-copy">
        <p className="eyebrow">Civilizational energy</p>
        <h1>Kardashev Scale</h1>
        <p>
          The Kardashev scale measures technological advancement by the amount of energy a civilization can use. Soviet astronomer Nikolai Kardashev proposed the original scale in 1964.
        </p>
        <a className="primary-link" href="/calculator">Open the calculator</a>
      </div>
      <div className="civStyle intro-copy micro-copy">
        <p className="eyebrow">Inverting the scale</p>
        <h2>Micro-Dimensional Mastery</h2>
        <p>
          John D. Barrow reversed the classification downward, measuring mastery over progressively smaller structures—from human-scale construction to biology, atoms, nuclei, particles, and ultimately space-time itself.
        </p>
        <a className="text-link" href="https://en.wikipedia.org/wiki/Kardashev_scale" target="_blank" rel="noreferrer">Read the source</a>
      </div>
      <span className="direction" aria-hidden="true">↓</span>
    </div>
  );
}

function BackgroundVideo({ src, active }) {
  return (
    <video
      className="section-video"
      src={active ? src : undefined}
      autoPlay={active}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}

export default function LifeScale() {
  const scrollerRef = useRef(null);
  const sectionRefs = useRef([]);
  const [currentPage, setCurrentPage] = useState(INTRO_INDEX);

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

  useEffect(() => {
    const savedPage = Number.parseInt(window.sessionStorage.getItem('kardashev-page') || '', 10);
    const initialPage = Number.isInteger(savedPage) && savedPage >= 0 && savedPage < sections.length
      ? savedPage
      : INTRO_INDEX;

    setCurrentPage(initialPage);
    requestAnimationFrame(() => {
      sectionRefs.current[initialPage]?.scrollIntoView({ block: 'start' });
    });
  }, [sections.length]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const nextPage = Number(visible.target.dataset.index);
      setCurrentPage(nextPage);
      window.sessionStorage.setItem('kardashev-page', String(nextPage));
    }, { root, threshold: [0.55, 0.72] });

    sectionRefs.current.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, [sections.length]);

  const move = (offset) => {
    const next = Math.max(0, Math.min(sections.length - 1, currentPage + offset));
    sectionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="scale-shell">
      <div className="scale-status" aria-live="polite">
        <span>{String(currentPage + 1).padStart(2, '0')} / {sections.length}</span>
        <strong>{sections[currentPage].label}</strong>
      </div>

      <div className="scale-controls">
        <button type="button" onClick={() => move(-1)} disabled={currentPage === 0} aria-label="Previous civilization type">↑</button>
        <button type="button" onClick={() => move(1)} disabled={currentPage === sections.length - 1} aria-label="Next civilization type">↓</button>
      </div>

      <div className="scale-scroller" ref={scrollerRef}>
        {sections.map(({ id, video, Content }, index) => {
          const active = Math.abs(index - currentPage) <= 1;
          return (
            <section
              className={`scale-section section-${index}`}
              id={id}
              key={id}
              data-index={index}
              ref={(element) => { sectionRefs.current[index] = element; }}
            >
              <BackgroundVideo src={video} active={active} />
              <div className="video-vignette" />
              <div className="section-content">
                <Content />
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
