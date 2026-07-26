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
const SOUND_PREFERENCE_KEY = 'kardashev-sound-preference';

const SECTIONS = [
  { id: 'type-6', label: 'Type VI', group: 'Macro scale', video: `${MEDIA_ROOT}/time.mp4`, Content: Type6 },
  { id: 'type-5', label: 'Type V', group: 'Macro scale', video: `${MEDIA_ROOT}/multiverse.mp4`, Content: Type5 },
  { id: 'type-4', label: 'Type IV', group: 'Macro scale', video: `${MEDIA_ROOT}/deep.mp4`, Content: Type4 },
  { id: 'type-3', label: 'Type III', group: 'Macro scale', video: `${MEDIA_ROOT}/galaxies.mp4`, Content: Type3 },
  { id: 'type-2', label: 'Type II', group: 'Macro scale', video: `${MEDIA_ROOT}/star.mp4`, Content: Type2 },
  { id: 'type-1', label: 'Type I', group: 'Macro scale', video: `${MEDIA_ROOT}/planets.mp4`, Content: Type1 },
  { id: 'type-0', label: 'Type 0', group: 'Macro scale', video: `${MEDIA_ROOT}/earth.mp4`, Content: Type0 },
  { id: 'introduction', label: 'Present', group: 'You are here', video: `${MEDIA_ROOT}/base.mp4`, Content: Introduction },
  { id: 'type-i-minus', label: 'Type I−', group: 'Micro scale', video: `${MEDIA_ROOT}/skylinep.mp4`, Content: TypeI },
  { id: 'type-ii-minus', label: 'Type II−', group: 'Micro scale', video: `${MEDIA_ROOT}/crispr.mp4`, Content: TypeII },
  { id: 'type-iii-minus', label: 'Type III−', group: 'Micro scale', video: `${MEDIA_ROOT}/galaxy.mp4`, Content: TypeIII },
  { id: 'type-iv-minus', label: 'Type IV−', group: 'Micro scale', video: `${MEDIA_ROOT}/atomboy.mp4`, Content: TypeIV },
  { id: 'type-v-minus', label: 'Type V−', group: 'Micro scale', video: `${MEDIA_ROOT}/galaxy.mp4`, Content: TypeV },
  { id: 'type-vi-minus', label: 'Type VI−', group: 'Micro scale', video: `${MEDIA_ROOT}/galaxy.mp4`, Content: TypeVI },
  { id: 'type-omega-minus', label: 'Type Ω−', group: 'Micro scale', video: `${MEDIA_ROOT}/galaxy.mp4`, Content: TypeO },
];

function clampPage(value) {
  return Math.max(0, Math.min(SECTIONS.length - 1, value));
}

function getInitialPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedPage = Number.parseInt(params.get('page') || '', 10);
  if (Number.isInteger(requestedPage)) return clampPage(requestedPage);

  const hashId = window.location.hash.replace(/^#/, '');
  const hashPage = SECTIONS.findIndex((section) => section.id === hashId);
  if (hashPage >= 0) return hashPage;

  const savedPage = Number.parseInt(window.sessionStorage.getItem('kardashev-page') || '', 10);
  return Number.isInteger(savedPage) ? clampPage(savedPage) : INTRO_INDEX;
}

function getSavedSoundPreference() {
  const preference = window.localStorage.getItem(SOUND_PREFERENCE_KEY);
  return preference === 'on' || preference === 'off' ? preference : null;
}

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
          Move upward through increasingly powerful civilizations, or use the <a href="/calculator">calculator</a> to locate a precise rating.
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

function BackgroundVideo({ src, active, ready, preload, videoRef, onReady, onError }) {
  return (
    <video
      ref={videoRef}
      className={`section-video${active ? ' is-active' : ''}${ready ? ' is-ready' : ''}`}
      src={src}
      autoPlay={active}
      muted
      loop
      playsInline
      preload={preload}
      disablePictureInPicture
      aria-hidden="true"
      onLoadedData={onReady}
      onCanPlay={onReady}
      onPlaying={onReady}
      onError={onError}
    />
  );
}

function LoadingIndicator({ failed, onRetry }) {
  return (
    <div className={`section-loader${failed ? ' has-error' : ''}`} role="status" aria-live="polite">
      {!failed && <span className="media-spinner" aria-hidden="true" />}
      <strong>{failed ? 'Video failed to load' : 'Loading cinematic media'}</strong>
      {failed && (
        <button type="button" onClick={onRetry}>Retry video</button>
      )}
    </div>
  );
}

export default function LifeScale() {
  const audioRef = useRef(null);
  const videoRefs = useRef([]);
  const touchState = useRef(null);
  const wheelLocked = useRef(false);
  const transitionTimer = useRef(null);
  const preloadTimers = useRef([]);

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [soundPreference, setSoundPreference] = useState(getSavedSoundPreference);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundStarting, setSoundStarting] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [readyVideos, setReadyVideos] = useState(() => new Set());
  const [failedVideos, setFailedVideos] = useState(() => new Set());
  const [warmVideos, setWarmVideos] = useState(() => new Set([
    currentPage,
    clampPage(currentPage - 1),
    clampPage(currentPage + 1),
  ]));

  const readyCount = readyVideos.size;
  const activeReady = readyVideos.has(currentPage);
  const activeFailed = failedVideos.has(currentPage);
  const showEntry = soundPreference === null;

  const preloadOrder = useMemo(() => {
    return SECTIONS
      .map((_, index) => index)
      .sort((a, b) => Math.abs(a - currentPage) - Math.abs(b - currentPage));
  }, [currentPage]);

  const markVideoReady = useCallback((index) => {
    setReadyVideos((previous) => {
      if (previous.has(index)) return previous;
      const next = new Set(previous);
      next.add(index);
      return next;
    });
    setFailedVideos((previous) => {
      if (!previous.has(index)) return previous;
      const next = new Set(previous);
      next.delete(index);
      return next;
    });
  }, []);

  const markVideoFailed = useCallback((index) => {
    setFailedVideos((previous) => {
      if (previous.has(index)) return previous;
      const next = new Set(previous);
      next.add(index);
      return next;
    });
  }, []);

  const goToPage = useCallback((nextPage) => {
    const next = clampPage(nextPage);
    if (next === currentPage || isTransitioning) return;

    setIsTransitioning(true);
    setCurrentPage(next);
    setMapOpen(false);
    window.sessionStorage.setItem('kardashev-page', String(next));
    window.history.replaceState(null, '', `/#${SECTIONS[next].id}`);

    window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
  }, [currentPage, isTransitioning]);

  const move = useCallback((offset) => {
    goToPage(currentPage + offset);
  }, [currentPage, goToPage]);

  const retryVideo = useCallback((index) => {
    setFailedVideos((previous) => {
      const next = new Set(previous);
      next.delete(index);
      return next;
    });
    setReadyVideos((previous) => {
      const next = new Set(previous);
      next.delete(index);
      return next;
    });

    const video = videoRefs.current[index];
    if (video) {
      video.preload = 'auto';
      video.load();
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem('kardashev-page', String(currentPage));
    if (window.location.search) {
      window.history.replaceState(null, '', `/#${SECTIONS[currentPage].id}`);
    }
  }, [currentPage]);

  useEffect(() => {
    return () => {
      window.clearTimeout(transitionTimer.current);
      preloadTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    preloadTimers.current.forEach((timer) => window.clearTimeout(timer));
    preloadTimers.current = preloadOrder.map((index, position) => window.setTimeout(() => {
      setWarmVideos((previous) => {
        if (previous.has(index)) return previous;
        const next = new Set(previous);
        next.add(index);
        return next;
      });
    }, position * 180));

    return () => preloadTimers.current.forEach((timer) => window.clearTimeout(timer));
  }, [preloadOrder]);

  useEffect(() => {
    warmVideos.forEach((index) => {
      const video = videoRefs.current[index];
      if (!video || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
      video.preload = 'auto';
      if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load();
    });
  }, [warmVideos]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentPage) {
        const playAttempt = video.play();
        if (playAttempt?.then) {
          playAttempt
            .then(() => markVideoReady(index))
            .catch(() => undefined);
        }
      } else {
        video.pause();
      }
    });
  }, [currentPage, markVideoReady]);

  useEffect(() => {
    if (soundPreference !== 'on') return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.64;
    const playAttempt = audio.play();
    if (playAttempt?.then) {
      playAttempt
        .then(() => {
          setSoundEnabled(true);
          setAudioError('');
        })
        .catch(() => setSoundEnabled(false));
    }
  }, [soundPreference]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const activeVideo = videoRefs.current[currentPage];
      if (document.hidden) {
        activeVideo?.pause();
        audioRef.current?.pause();
        return;
      }

      activeVideo?.play()
        .then(() => markVideoReady(currentPage))
        .catch(() => undefined);
      if (soundEnabled) audioRef.current?.play().catch(() => setSoundEnabled(false));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentPage, markVideoReady, soundEnabled]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;

      if (event.key === 'Escape') {
        setMapOpen(false);
        return;
      }
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
    const content = event.target.closest?.('.section-content');
    if (content && content.scrollHeight > content.clientHeight + 2) {
      const maxScroll = content.scrollHeight - content.clientHeight;
      const canScrollDown = event.deltaY > 0 && content.scrollTop < maxScroll - 2;
      const canScrollUp = event.deltaY < 0 && content.scrollTop > 2;
      if (canScrollDown || canScrollUp) return;
    }

    event.preventDefault();
    if (wheelLocked.current || Math.abs(event.deltaY) < 18) return;
    wheelLocked.current = true;
    move(event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => { wheelLocked.current = false; }, TRANSITION_MS);
  };

  const handleTouchStart = (event) => {
    const content = event.target.closest?.('.section-content') ?? null;
    const y = event.touches[0]?.clientY ?? null;
    touchState.current = {
      startY: y,
      content,
      startScrollTop: content?.scrollTop ?? 0,
      maxScroll: content ? content.scrollHeight - content.clientHeight : 0,
    };
  };

  const handleTouchEnd = (event) => {
    const state = touchState.current;
    if (!state || state.startY === null) return;

    const endY = event.changedTouches[0]?.clientY ?? state.startY;
    const delta = state.startY - endY;
    touchState.current = null;
    if (Math.abs(delta) < 48) return;

    if (state.content && state.maxScroll > 2) {
      const scrollMoved = Math.abs(state.content.scrollTop - state.startScrollTop) > 2;
      if (scrollMoved) return;

      const atTop = state.content.scrollTop <= 2;
      const atBottom = state.content.scrollTop >= state.maxScroll - 2;
      if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) return;
    }

    move(delta > 0 ? 1 : -1);
  };

  const chooseSound = async (preference) => {
    const audio = audioRef.current;
    setAudioError('');

    if (preference === 'off') {
      audio?.pause();
      setSoundEnabled(false);
      setSoundPreference('off');
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, 'off');
      return;
    }

    if (!audio) {
      setSoundPreference(null);
      setSoundEnabled(false);
      setAudioError('The soundtrack is unavailable. Try again after the page finishes loading.');
      return;
    }

    setSoundStarting(true);
    try {
      audio.volume = 0.64;
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
      await audio.play();
      setSoundEnabled(true);
      setSoundPreference('on');
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, 'on');
    } catch {
      setSoundEnabled(false);
      setSoundPreference(null);
      window.localStorage.removeItem(SOUND_PREFERENCE_KEY);
      setAudioError('Sound could not start. Tap “Enter with sound” again.');
    } finally {
      setSoundStarting(false);
    }
  };

  const toggleSound = async () => {
    const nextPreference = soundEnabled ? 'off' : 'on';
    await chooseSound(nextPreference);
  };

  return (
    <main className={`scale-shell${isTransitioning ? ' is-transitioning' : ''}`}>
      <audio
        ref={audioRef}
        src={music}
        loop
        preload="auto"
        onError={() => {
          setSoundEnabled(false);
          setAudioError('The soundtrack failed to load.');
        }}
      />

      {showEntry && (
        <div className="entry-gate" role="dialog" aria-modal="true" aria-labelledby="entry-title">
          <div className="entry-gate-content">
            <p className="entry-kicker">Interactive cosmic scale</p>
            <h1 id="entry-title">Enter the Kardashev Scale</h1>
            <div className="entry-load-state" aria-live="polite">
              {!activeReady && !activeFailed && <span className="media-spinner" aria-hidden="true" />}
              <span>{audioError || (activeFailed ? 'The opening video could not load. You can still enter.' : activeReady ? `${readyCount} of ${SECTIONS.length} videos ready` : 'Preparing the opening sequence — you can enter now')}</span>
            </div>
            <div className="entry-actions">
              <button type="button" className="entry-primary" onClick={() => chooseSound('on')} disabled={soundStarting}>
                {soundStarting ? 'Starting sound…' : 'Enter with sound'}
              </button>
              <button type="button" onClick={() => chooseSound('off')} disabled={soundStarting}>Continue muted</button>
            </div>
          </div>
        </div>
      )}

      <button className="scale-status" type="button" onClick={() => setMapOpen(true)} aria-expanded={mapOpen} aria-controls="scale-map">
        <span>{String(currentPage + 1).padStart(2, '0')} / {SECTIONS.length}</span>
        <strong>{SECTIONS[currentPage].label}</strong>
        <small>{readyCount}/{SECTIONS.length} ready</small>
      </button>

      <button className={`sound-control${soundEnabled ? ' is-on' : ''}`} type="button" onClick={toggleSound} disabled={soundStarting}>
        {soundStarting ? 'Starting…' : soundEnabled ? 'Sound on' : 'Sound off'}
      </button>

      <div className="scale-controls">
        <button type="button" onClick={() => move(-1)} disabled={currentPage === 0} aria-label="Previous civilization type">↑</button>
        <button type="button" onClick={() => move(1)} disabled={currentPage === SECTIONS.length - 1} aria-label="Next civilization type">↓</button>
      </div>

      {mapOpen && <button className="scale-map-backdrop" type="button" onClick={() => setMapOpen(false)} aria-label="Close scale navigator" />}
      <aside id="scale-map" className={`scale-map${mapOpen ? ' is-open' : ''}`} aria-hidden={!mapOpen}>
        <div className="scale-map-header">
          <div>
            <span>Navigation</span>
            <h2>The complete scale</h2>
          </div>
          <button type="button" onClick={() => setMapOpen(false)} aria-label="Close scale navigator">×</button>
        </div>
        <div className="scale-map-list">
          {SECTIONS.map((section, index) => (
            <button
              type="button"
              className={index === currentPage ? 'is-current' : ''}
              key={section.id}
              onClick={() => goToPage(index)}
            >
              <span className={`scale-map-dot${readyVideos.has(index) ? ' is-ready' : ''}${failedVideos.has(index) ? ' has-error' : ''}`} />
              <strong>{section.label}</strong>
              <small>{section.group}</small>
            </button>
          ))}
        </div>
        <a className="scale-map-calculator" href="/calculator">Open the calculator →</a>
      </aside>

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
          {SECTIONS.map(({ id, video, Content }, index) => {
            const active = index === currentPage;
            const ready = readyVideos.has(index);
            const failed = failedVideos.has(index);
            return (
              <section
                className={`scale-section section-${index}${active ? ' is-active' : ''}${ready ? ' has-ready-video' : ''}`}
                id={id}
                key={id}
                aria-hidden={!active}
              >
                <BackgroundVideo
                  src={video}
                  active={active}
                  ready={ready}
                  preload={warmVideos.has(index) ? 'auto' : 'metadata'}
                  videoRef={(element) => {
                    videoRefs.current[index] = element;
                    if (element?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markVideoReady(index);
                  }}
                  onReady={() => markVideoReady(index)}
                  onError={() => markVideoFailed(index)}
                />
                <div className="video-vignette" />
                {!ready && active && <LoadingIndicator failed={failed} onRetry={() => retryVideo(index)} />}
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
