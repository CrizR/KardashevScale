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
import ImmersionCanvas from './ImmersionCanvas';
import './Immersive.css';

const MEDIA_ROOT = 'https://kardashev-calc.s3.amazonaws.com';
const INTRO_INDEX = 7;
const TRANSITION_MS = 1080;
const BOUNDARY_MS = 1700;
const SOUND_PREFERENCE_KEY = 'kardashev-sound-preference';
const ENTRY_SESSION_KEY = 'kardashev-entry-seen';

const SECTIONS = [
  {
    id: 'type-6',
    label: 'Type VI',
    group: 'Speculative scale',
    video: `${MEDIA_ROOT}/time.mp4`,
    Content: Type6,
    realm: 'speculative',
    accent: '#f0d8ff',
    glow: 'rgba(226, 177, 255, 0.42)',
    wash: 'rgba(95, 42, 121, 0.36)',
    scaleLabel: 'Designed realities',
    classification: 'Speculative extension',
    comparison: 'Geometry, causality, and the conditions of cosmic birth become engineering materials.',
    audio: { highpass: 24, lowpass: 11800, gain: 0.56, tone: 42 },
  },
  {
    id: 'type-5',
    label: 'Type V',
    group: 'Speculative scale',
    video: `${MEDIA_ROOT}/multiverse.mp4`,
    Content: Type5,
    realm: 'speculative',
    accent: '#d9b8ff',
    glow: 'rgba(181, 121, 255, 0.46)',
    wash: 'rgba(67, 26, 105, 0.38)',
    scaleLabel: 'Universe foundries',
    classification: 'Speculative extension',
    comparison: 'Entire universes become potential habitats, laboratories, archives, and machines.',
    audio: { highpass: 22, lowpass: 10400, gain: 0.56, tone: 46 },
  },
  {
    id: 'type-4',
    label: 'Type IV',
    group: 'Speculative scale',
    video: `${MEDIA_ROOT}/deep.mp4`,
    Content: Type4,
    realm: 'speculative',
    accent: '#bbadff',
    glow: 'rgba(143, 128, 255, 0.44)',
    wash: 'rgba(35, 35, 96, 0.38)',
    scaleLabel: 'The observable universe',
    classification: 'Speculative extension',
    comparison: 'Galaxy clusters and the cosmic web become one distributed civilization-scale system.',
    audio: { highpass: 20, lowpass: 9200, gain: 0.57, tone: 50 },
  },
  {
    id: 'type-3',
    label: 'Type III',
    group: 'Kardashev scale',
    video: `${MEDIA_ROOT}/galaxies.mp4`,
    Content: Type3,
    realm: 'macro',
    accent: '#a9bfff',
    glow: 'rgba(111, 144, 255, 0.42)',
    wash: 'rgba(22, 39, 86, 0.38)',
    scaleLabel: 'A galaxy',
    classification: 'Original Kardashev scale',
    comparison: 'Billions of stellar systems become linked centers of life, industry, and computation.',
    audio: { highpass: 20, lowpass: 8200, gain: 0.58, tone: 54 },
  },
  {
    id: 'type-2',
    label: 'Type II',
    group: 'Kardashev scale',
    video: `${MEDIA_ROOT}/star.mp4`,
    Content: Type2,
    realm: 'macro',
    accent: '#ffd695',
    glow: 'rgba(255, 181, 76, 0.46)',
    wash: 'rgba(121, 64, 10, 0.35)',
    scaleLabel: 'A star',
    classification: 'Original Kardashev scale',
    comparison: 'A solar system becomes an engineered habitat powered by a meaningful share of its star.',
    audio: { highpass: 24, lowpass: 7000, gain: 0.58, tone: 59 },
  },
  {
    id: 'type-1',
    label: 'Type I',
    group: 'Kardashev scale',
    video: `${MEDIA_ROOT}/planets.mp4`,
    Content: Type1,
    realm: 'macro',
    accent: '#8ff4d3',
    glow: 'rgba(70, 229, 183, 0.38)',
    wash: 'rgba(10, 90, 74, 0.32)',
    scaleLabel: 'A planet',
    classification: 'Original Kardashev scale',
    comparison: 'The energy flowing through an entire world becomes reliable civilization infrastructure.',
    audio: { highpass: 28, lowpass: 6200, gain: 0.59, tone: 64 },
  },
  {
    id: 'type-0',
    label: 'Type 0',
    group: 'Preplanetary scale',
    video: `${MEDIA_ROOT}/earth.mp4`,
    Content: Type0,
    realm: 'macro',
    accent: '#79d7ff',
    glow: 'rgba(69, 185, 255, 0.4)',
    wash: 'rgba(8, 72, 114, 0.34)',
    scaleLabel: 'A connected world',
    classification: 'Later extension',
    comparison: 'A planetary nervous system emerges before the civilization can fully control planetary energy.',
    audio: { highpass: 32, lowpass: 5400, gain: 0.6, tone: 70 },
  },
  {
    id: 'introduction',
    label: 'Present',
    group: 'You are here',
    video: `${MEDIA_ROOT}/base.mp4`,
    Content: Introduction,
    realm: 'present',
    accent: '#d7b6ff',
    glow: 'rgba(190, 146, 255, 0.42)',
    wash: 'rgba(72, 44, 103, 0.34)',
    scaleLabel: 'The point of departure',
    classification: 'Two directions of mastery',
    comparison: 'Travel upward through energy scales or downward through the structure of matter itself.',
    audio: { highpass: 36, lowpass: 5000, gain: 0.6, tone: 76 },
  },
  {
    id: 'type-i-minus',
    label: 'Type I−',
    group: 'Barrow scale',
    video: `${MEDIA_ROOT}/skylinep.mp4`,
    Content: TypeI,
    realm: 'micro',
    accent: '#ffbd8d',
    glow: 'rgba(255, 145, 82, 0.4)',
    wash: 'rgba(111, 54, 20, 0.34)',
    scaleLabel: 'Human-scale matter',
    classification: 'Barrow microdimensional scale',
    comparison: 'Landscapes, structures, machines, and materials can be reshaped at macroscopic scales.',
    audio: { highpass: 44, lowpass: 6200, gain: 0.59, tone: 94 },
  },
  {
    id: 'type-ii-minus',
    label: 'Type II−',
    group: 'Barrow scale',
    video: `${MEDIA_ROOT}/crispr.mp4`,
    Content: TypeII,
    realm: 'micro',
    accent: '#ff8ebf',
    glow: 'rgba(255, 96, 158, 0.4)',
    wash: 'rgba(103, 18, 59, 0.34)',
    scaleLabel: 'Living systems',
    classification: 'Barrow microdimensional scale',
    comparison: 'Genetic information and biological development become readable and programmable.',
    audio: { highpass: 62, lowpass: 7200, gain: 0.58, tone: 116 },
  },
  {
    id: 'type-iii-minus',
    label: 'Type III−',
    group: 'Barrow scale',
    video: `${MEDIA_ROOT}/galaxy.mp4`,
    Content: TypeIII,
    realm: 'micro',
    accent: '#e18cff',
    glow: 'rgba(202, 92, 255, 0.42)',
    wash: 'rgba(76, 20, 104, 0.35)',
    scaleLabel: 'Molecules and bonds',
    classification: 'Barrow microdimensional scale',
    comparison: 'Matter can be designed by controlling how atoms connect and how reactions unfold.',
    audio: { highpass: 84, lowpass: 8600, gain: 0.57, tone: 144 },
  },
  {
    id: 'type-iv-minus',
    label: 'Type IV−',
    group: 'Barrow scale',
    video: `${MEDIA_ROOT}/atomboy.mp4`,
    Content: TypeIV,
    realm: 'micro',
    accent: '#92a8ff',
    glow: 'rgba(103, 132, 255, 0.42)',
    wash: 'rgba(30, 47, 108, 0.35)',
    scaleLabel: 'Individual atoms',
    classification: 'Barrow microdimensional scale',
    comparison: 'Atomically precise manufacturing can remove defects and build matter from the bottom upward.',
    audio: { highpass: 110, lowpass: 10400, gain: 0.56, tone: 176 },
  },
  {
    id: 'type-v-minus',
    label: 'Type V−',
    group: 'Barrow scale',
    video: `${MEDIA_ROOT}/galaxy.mp4`,
    Content: TypeV,
    realm: 'micro',
    accent: '#73e2ff',
    glow: 'rgba(59, 209, 255, 0.42)',
    wash: 'rgba(12, 77, 104, 0.35)',
    scaleLabel: 'Atomic nuclei',
    classification: 'Barrow microdimensional scale',
    comparison: 'Elements, isotopes, fusion, fission, and nuclear states become deliberate manufacturing choices.',
    audio: { highpass: 148, lowpass: 12400, gain: 0.55, tone: 214 },
  },
  {
    id: 'type-vi-minus',
    label: 'Type VI−',
    group: 'Barrow scale',
    video: `${MEDIA_ROOT}/galaxy.mp4`,
    Content: TypeVI,
    realm: 'micro',
    accent: '#8fffe4',
    glow: 'rgba(69, 255, 208, 0.4)',
    wash: 'rgba(11, 94, 77, 0.34)',
    scaleLabel: 'Elementary particles',
    classification: 'Barrow microdimensional scale',
    comparison: 'Quarks, leptons, fields, and matter-energy conversion become potential fabrication tools.',
    audio: { highpass: 190, lowpass: 14800, gain: 0.54, tone: 264 },
  },
  {
    id: 'type-omega-minus',
    label: 'Type Ω−',
    group: 'Barrow scale',
    video: `${MEDIA_ROOT}/galaxy.mp4`,
    Content: TypeO,
    realm: 'micro',
    accent: '#ffffff',
    glow: 'rgba(222, 246, 255, 0.44)',
    wash: 'rgba(75, 88, 103, 0.32)',
    scaleLabel: 'Spacetime itself',
    classification: 'Speculative Barrow endpoint',
    comparison: 'The geometry and quantum structure of spacetime become the final proposed engineering frontier.',
    audio: { highpass: 240, lowpass: 17000, gain: 0.53, tone: 330 },
  },
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

function getInitialEntryState() {
  return window.sessionStorage.getItem(ENTRY_SESSION_KEY) !== 'seen';
}

function isBoundaryCrossing(from, to) {
  return (from === 3 && to === 2) || (from === 2 && to === 3);
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

function Introduction() {
  return (
    <div className="intro-content">
      <span className="direction direction-up" aria-hidden="true">↑</span>
      <div className="civStyle intro-copy">
        <h1>Kardashev Scale</h1>
        <p>
          The Kardashev scale measures technological advancement through the amount of energy a civilization can use. Soviet astronomer Nikolai Kardashev proposed the original three levels in 1964.
        </p>
        <p>
          Move upward through planetary, stellar, and galactic power, or use the <a href="/calculator">calculator</a> to locate a precise rating.
        </p>
      </div>

      <div className="civStyle intro-copy micro-copy">
        <h1>Micro-Dimensional Mastery</h1>
        <p>
          John D. Barrow reversed the journey. His scale moves downward from human-scale construction through biology, molecules, atoms, nuclei, particles, and ultimately spacetime itself.
        </p>
        <a className="source-link" href="https://en.wikipedia.org/wiki/Kardashev_scale" target="_blank" rel="noreferrer">Read the background</a>
      </div>
      <span className="direction direction-down" aria-hidden="true">↓</span>
    </div>
  );
}

function BackgroundVideo({ active, onError, onReady, preload, shouldLoad, src, videoRef }) {
  const internalRef = useRef(null);

  useEffect(() => {
    const video = internalRef.current;
    if (!video || shouldLoad) return;
    video.pause();
    video.removeAttribute('src');
    video.load();
  }, [shouldLoad]);

  return (
    <video
      ref={(element) => {
        internalRef.current = element;
        videoRef(element);
      }}
      className={`section-video${active ? ' is-active' : ''}`}
      src={shouldLoad ? src : undefined}
      autoPlay={active}
      muted
      loop
      playsInline
      preload={shouldLoad ? preload : 'none'}
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
      <strong>{failed ? 'The video failed to load.' : 'The next scale is coming into focus.'}</strong>
      {failed && <button type="button" onClick={onRetry}>Retry video</button>}
    </div>
  );
}

function BoundaryMoment({ active, returning }) {
  return (
    <div className={`boundary-moment${active ? ' is-active' : ''}`} aria-hidden={!active} role="status">
      <div className="boundary-horizon" />
      <div className="boundary-copy">
        <span>{returning ? 'Returning to the original framework' : 'You have reached the edge of the original framework'}</span>
        <h2>{returning ? 'Kardashev Type III' : 'Kardashev’s original scale ends here.'}</h2>
        <p>{returning ? 'The planetary, stellar, and galactic levels are Kardashev’s original three categories.' : 'Types IV through VI are speculative extensions rather than part of Kardashev’s 1964 proposal.'}</p>
      </div>
    </div>
  );
}

function ScaleRail({ currentPage, onSelect }) {
  return (
    <nav className="scale-rail" aria-label="Scale position">
      <div className="scale-rail-line" />
      {SECTIONS.map((section, index) => (
        <button
          type="button"
          key={section.id}
          className={index === currentPage ? 'is-current' : ''}
          style={{ '--rail-position': `${(index / (SECTIONS.length - 1)) * 100}%` }}
          aria-label={`Go to ${section.label}`}
          onClick={() => onSelect(index)}
        >
          <span />
        </button>
      ))}
    </nav>
  );
}

export default function LifeScale() {
  const shellRef = useRef(null);
  const audioRef = useRef(null);
  const audioGraphRef = useRef(null);
  const videoRefs = useRef([]);
  const pointerState = useRef(null);
  const wheelAccumulator = useRef(0);
  const wheelResetTimer = useRef(null);
  const transitionTimer = useRef(null);
  const boundaryTimer = useRef(null);
  const controlsTimer = useRef(null);
  const revealTimer = useRef(null);
  const pressTimer = useRef(null);
  const wakeLockRef = useRef(null);

  const reducedMotion = useReducedMotion();
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('outward');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(true);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreenActive, setFullscreenActive] = useState(Boolean(document.fullscreenElement));
  const [boundaryActive, setBoundaryActive] = useState(false);
  const [boundaryReturning, setBoundaryReturning] = useState(false);
  const [entryOpen, setEntryOpen] = useState(getInitialEntryState);
  const [soundPreference, setSoundPreference] = useState(getSavedSoundPreference);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundStarting, setSoundStarting] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [readyVideos, setReadyVideos] = useState(() => new Set());
  const [failedVideos, setFailedVideos] = useState(() => new Set());

  const currentSection = SECTIONS[currentPage];
  const readyCount = readyVideos.size;
  const activeReady = readyVideos.has(currentPage);
  const activeFailed = failedVideos.has(currentPage);
  const mediaWindow = useMemo(() => new Set(SECTIONS
    .map((_, index) => index)
    .filter((index) => Math.abs(index - currentPage) <= 2)), [currentPage]);

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

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator) || document.hidden) return;

    try {
      wakeLockRef.current?.release?.();
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      wakeLockRef.current = null;
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release?.();
    wakeLockRef.current = null;
  }, []);

  const requestFullscreen = useCallback(() => {
    if (document.fullscreenElement || !document.documentElement.requestFullscreen) return Promise.resolve();
    return document.documentElement.requestFullscreen().catch(() => undefined);
  }, []);

  const ensureAudioGraph = useCallback(() => {
    if (audioGraphRef.current) return audioGraphRef.current;
    const audio = audioRef.current;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audio || !AudioContextClass) return null;

    try {
      const context = new AudioContextClass();
      const source = context.createMediaElementSource(audio);
      const highpass = context.createBiquadFilter();
      const lowpass = context.createBiquadFilter();
      const master = context.createGain();
      const effects = context.createGain();

      highpass.type = 'highpass';
      lowpass.type = 'lowpass';
      highpass.frequency.value = 30;
      lowpass.frequency.value = 7000;
      master.gain.value = 0.6;
      effects.gain.value = 0.72;

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(master);
      effects.connect(master);
      master.connect(context.destination);

      audio.volume = 1;
      audioGraphRef.current = { context, source, highpass, lowpass, master, effects };
      return audioGraphRef.current;
    } catch {
      return null;
    }
  }, []);

  const applyAudioProfile = useCallback((section = currentSection) => {
    const graph = audioGraphRef.current;
    if (!graph) return;
    const now = graph.context.currentTime;
    graph.highpass.frequency.setTargetAtTime(section.audio.highpass, now, 0.42);
    graph.lowpass.frequency.setTargetAtTime(section.audio.lowpass, now, 0.52);
    graph.master.gain.setTargetAtTime(section.audio.gain, now, 0.42);
  }, [currentSection]);

  const playTransitionTone = useCallback((direction, boundary = false, target = currentSection) => {
    const graph = audioGraphRef.current;
    if (!graph || !soundEnabled || reducedMotion) return;

    const now = graph.context.currentTime;
    const oscillator = graph.context.createOscillator();
    const gain = graph.context.createGain();
    oscillator.type = direction === 'outward' ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(target.audio.tone, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      direction === 'outward' ? Math.max(28, target.audio.tone * 0.58) : target.audio.tone * 2.2,
      now + 0.8,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(boundary ? 0.11 : 0.055, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (boundary ? 1.35 : 0.88));
    oscillator.connect(gain);
    gain.connect(graph.effects);
    oscillator.start(now);
    oscillator.stop(now + (boundary ? 1.42 : 0.94));

    if (boundary) {
      const overtone = graph.context.createOscillator();
      const overtoneGain = graph.context.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(target.audio.tone * 2.02, now + 0.08);
      overtone.frequency.exponentialRampToValueAtTime(target.audio.tone * 0.72, now + 1.4);
      overtoneGain.gain.setValueAtTime(0.0001, now);
      overtoneGain.gain.exponentialRampToValueAtTime(0.032, now + 0.22);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.42);
      overtone.connect(overtoneGain);
      overtoneGain.connect(graph.effects);
      overtone.start(now + 0.06);
      overtone.stop(now + 1.48);
    }
  }, [currentSection, reducedMotion, soundEnabled]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(controlsTimer.current);
    if (immersiveMode && !mapOpen && !entryOpen) {
      controlsTimer.current = window.setTimeout(() => setControlsVisible(false), 2400);
    }
  }, [entryOpen, immersiveMode, mapOpen]);

  const goToPage = useCallback((nextPage) => {
    const next = clampPage(nextPage);
    if (next === currentPage || isTransitioning) {
      setDragOffset(0);
      setIsDragging(false);
      return;
    }

    const direction = next < currentPage ? 'outward' : 'inward';
    const crossingBoundary = isBoundaryCrossing(currentPage, next);
    setTransitionDirection(direction);
    setIsTransitioning(true);
    setIsDragging(false);
    setDragOffset(0);
    setCurrentPage(next);
    setMapOpen(false);
    setContentReady(false);
    setDetailsVisible(!immersiveMode);
    window.sessionStorage.setItem('kardashev-page', String(next));
    window.history.replaceState(null, '', `/#${SECTIONS[next].id}`);
    playTransitionTone(direction, crossingBoundary, SECTIONS[next]);
    revealControls();

    if (crossingBoundary) {
      setBoundaryReturning(next === 3);
      setBoundaryActive(true);
      window.clearTimeout(boundaryTimer.current);
      boundaryTimer.current = window.setTimeout(() => setBoundaryActive(false), BOUNDARY_MS);
    }

    window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
  }, [currentPage, immersiveMode, isTransitioning, playTransitionTone, revealControls]);

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
      video.src = SECTIONS[index].video;
      video.preload = 'auto';
      video.load();
      if (index === currentPage) video.play().catch(() => undefined);
    }
  }, [currentPage]);

  const chooseSound = useCallback(async (preference) => {
    const audio = audioRef.current;
    setAudioError('');

    if (preference === 'off') {
      audio?.pause();
      setSoundEnabled(false);
      setSoundPreference('off');
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, 'off');
      return true;
    }

    if (!audio) {
      setSoundEnabled(false);
      setAudioError('The soundtrack is unavailable. Try again after the page finishes loading.');
      return false;
    }

    setSoundStarting(true);
    try {
      const graph = ensureAudioGraph();
      const playAttempt = audio.play();
      if (graph?.context.state === 'suspended') await graph.context.resume();
      await playAttempt;
      setSoundEnabled(true);
      setSoundPreference('on');
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, 'on');
      applyAudioProfile();
      return true;
    } catch {
      setSoundEnabled(false);
      setSoundPreference(null);
      window.localStorage.removeItem(SOUND_PREFERENCE_KEY);
      setAudioError('Sound could not start. Tap the sound option again.');
      return false;
    } finally {
      setSoundStarting(false);
    }
  }, [applyAudioProfile, ensureAudioGraph]);

  const finishEntry = useCallback(() => {
    window.sessionStorage.setItem(ENTRY_SESSION_KEY, 'seen');
    setEntryOpen(false);
    revealControls();
  }, [revealControls]);

  const enterImmersive = useCallback(async () => {
    const fullscreenAttempt = requestFullscreen();
    setImmersiveMode(true);
    setDetailsVisible(false);
    const started = await chooseSound('on');
    if (!started) return;
    finishEntry();
    await fullscreenAttempt;
    await requestWakeLock();
  }, [chooseSound, finishEntry, requestFullscreen, requestWakeLock]);

  const enterStandard = useCallback(async (withSound) => {
    setImmersiveMode(false);
    setDetailsVisible(true);
    const started = await chooseSound(withSound ? 'on' : 'off');
    if (started) finishEntry();
  }, [chooseSound, finishEntry]);

  const toggleImmersive = useCallback(async () => {
    if (immersiveMode) {
      setImmersiveMode(false);
      setDetailsVisible(true);
      setControlsVisible(true);
      releaseWakeLock();
      if (document.fullscreenElement) {
        const exitAttempt = document.exitFullscreen?.();
        await exitAttempt?.catch(() => undefined);
      }
      return;
    }

    setImmersiveMode(true);
    setDetailsVisible(false);
    const fullscreenAttempt = requestFullscreen();
    await requestWakeLock();
    await fullscreenAttempt;
    revealControls();
  }, [immersiveMode, releaseWakeLock, requestFullscreen, requestWakeLock, revealControls]);

  const toggleSound = useCallback(async () => {
    await chooseSound(soundEnabled ? 'off' : 'on');
    revealControls();
  }, [chooseSound, revealControls, soundEnabled]);

  const handleWheel = useCallback((event) => {
    if (entryOpen || mapOpen) return;
    const content = event.target.closest?.('.section-content');
    if (content && content.scrollHeight > content.clientHeight + 2) {
      const maxScroll = content.scrollHeight - content.clientHeight;
      const canScrollDown = event.deltaY > 0 && content.scrollTop < maxScroll - 2;
      const canScrollUp = event.deltaY < 0 && content.scrollTop > 2;
      if (canScrollDown || canScrollUp) return;
    }

    event.preventDefault();
    revealControls();
    if (isTransitioning) return;
    wheelAccumulator.current += event.deltaY;
    window.clearTimeout(wheelResetTimer.current);
    wheelResetTimer.current = window.setTimeout(() => { wheelAccumulator.current = 0; }, 180);
    if (Math.abs(wheelAccumulator.current) < 48) return;
    const direction = wheelAccumulator.current > 0 ? 1 : -1;
    wheelAccumulator.current = 0;
    move(direction);
  }, [entryOpen, isTransitioning, mapOpen, move, revealControls]);

  const handlePointerDown = useCallback((event) => {
    revealControls();
    if (entryOpen || mapOpen || event.target.closest?.('button, a, input, aside')) return;

    const content = event.target.closest?.('.section-content') ?? null;
    const contentScrollable = Boolean(content && content.scrollHeight > content.clientHeight + 3);
    pointerState.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocity: 0,
      content,
      maxScroll: content ? content.scrollHeight - content.clientHeight : 0,
      dragging: !contentScrollable,
      captureTarget: event.currentTarget,
    };

    if (!contentScrollable) {
      setIsDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      window.clearTimeout(pressTimer.current);
      pressTimer.current = window.setTimeout(() => setIsPeeking(true), 420);
    }
  }, [entryOpen, mapOpen, revealControls]);

  const handlePointerMove = useCallback((event) => {
    const shell = shellRef.current;
    if (shell) {
      const x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      const y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
      shell.style.setProperty('--pointer-x', x.toFixed(3));
      shell.style.setProperty('--pointer-y', y.toFixed(3));
    }
    revealControls();

    const state = pointerState.current;
    if (!state || state.id !== event.pointerId) return;
    let delta = event.clientY - state.startY;

    if (!state.dragging && state.content) {
      const atTop = state.content.scrollTop <= 2;
      const atBottom = state.content.scrollTop >= state.maxScroll - 2;
      const pullingTowardLargerScale = delta > 0;
      const pullingTowardSmallerScale = delta < 0;
      const reachedEdge = (pullingTowardLargerScale && atTop) || (pullingTowardSmallerScale && atBottom);
      if (!reachedEdge) return;

      state.dragging = true;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.lastY = event.clientY;
      state.lastTime = performance.now();
      delta = 0;
      setIsDragging(true);
      state.captureTarget?.setPointerCapture?.(event.pointerId);
      return;
    }

    const distance = Math.hypot(event.clientX - state.startX, delta);
    if (distance > 8) {
      window.clearTimeout(pressTimer.current);
      setIsPeeking(false);
    }

    const now = performance.now();
    const elapsed = Math.max(1, now - state.lastTime);
    state.velocity = (event.clientY - state.lastY) / elapsed;
    state.lastY = event.clientY;
    state.lastTime = now;
    setDragOffset(Math.max(-window.innerHeight * 0.32, Math.min(window.innerHeight * 0.32, delta * 0.72)));
  }, [revealControls]);

  const finishPointerGesture = useCallback((event) => {
    window.clearTimeout(pressTimer.current);
    setIsPeeking(false);
    const state = pointerState.current;
    pointerState.current = null;
    if (!state || state.id !== event.pointerId || !state.dragging) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const delta = event.clientY - state.startY;
    const shouldMove = Math.abs(delta) > 64 || Math.abs(state.velocity) > 0.48;
    setIsDragging(false);
    if (shouldMove) move(delta < 0 ? 1 : -1);
    else setDragOffset(0);
  }, [move]);

  useEffect(() => {
    window.sessionStorage.setItem('kardashev-page', String(currentPage));
    if (window.location.search) window.history.replaceState(null, '', `/#${SECTIONS[currentPage].id}`);

    window.clearTimeout(revealTimer.current);
    setContentReady(false);
    revealTimer.current = window.setTimeout(() => setContentReady(true), reducedMotion ? 80 : 520);
    applyAudioProfile(SECTIONS[currentPage]);

    return () => window.clearTimeout(revealTimer.current);
  }, [applyAudioProfile, currentPage, reducedMotion]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      const distance = Math.abs(index - currentPage);
      if (distance > 2) {
        video.pause();
        return;
      }

      video.preload = distance <= 1 ? 'auto' : 'metadata';
      if (index === currentPage) {
        video.play()
          .then(() => markVideoReady(index))
          .catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [currentPage, markVideoReady]);

  useEffect(() => {
    if (soundPreference !== 'on') return;
    const audio = audioRef.current;
    if (!audio) return;
    const playAttempt = audio.play();
    if (playAttempt?.then) {
      playAttempt
        .then(() => {
          setSoundEnabled(true);
          setAudioError('');
          ensureAudioGraph();
          applyAudioProfile();
        })
        .catch(() => setSoundEnabled(false));
    }
  }, [applyAudioProfile, ensureAudioGraph, soundPreference]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const activeVideo = videoRefs.current[currentPage];
      if (document.hidden) {
        activeVideo?.pause();
        audioRef.current?.pause();
        releaseWakeLock();
        return;
      }

      activeVideo?.play()
        .then(() => markVideoReady(currentPage))
        .catch(() => undefined);
      if (soundEnabled) audioRef.current?.play().catch(() => setSoundEnabled(false));
      if (immersiveMode) requestWakeLock();
    };

    const handleFullscreenChange = () => setFullscreenActive(Boolean(document.fullscreenElement));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentPage, immersiveMode, markVideoReady, releaseWakeLock, requestWakeLock, soundEnabled]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      revealControls();

      if (event.key === 'Escape') {
        setMapOpen(false);
        setIsPeeking(false);
        return;
      }
      if (event.key.toLowerCase() === 'l') {
        setDetailsVisible((visible) => !visible);
        return;
      }
      if (event.key.toLowerCase() === 'f') {
        requestFullscreen();
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
  }, [move, requestFullscreen, revealControls]);

  useEffect(() => {
    revealControls();
  }, [immersiveMode, mapOpen, revealControls]);

  useEffect(() => () => {
    window.clearTimeout(transitionTimer.current);
    window.clearTimeout(boundaryTimer.current);
    window.clearTimeout(controlsTimer.current);
    window.clearTimeout(revealTimer.current);
    window.clearTimeout(pressTimer.current);
    window.clearTimeout(wheelResetTimer.current);
    releaseWakeLock();
    audioGraphRef.current?.context?.close?.();
  }, [releaseWakeLock]);

  const shellClasses = [
    'scale-shell',
    `realm-${currentSection.realm}`,
    `travel-${transitionDirection}`,
    isTransitioning ? 'is-transitioning' : '',
    isDragging ? 'is-dragging' : '',
    isPeeking ? 'is-peeking' : '',
    immersiveMode ? 'is-immersive' : '',
    controlsVisible || mapOpen || entryOpen ? 'is-ui-visible' : 'is-ui-hidden',
    detailsVisible ? 'is-learning' : 'is-experiencing',
    boundaryActive ? 'is-crossing-boundary' : '',
  ].filter(Boolean).join(' ');

  return (
    <main
      ref={shellRef}
      className={shellClasses}
      style={{
        '--section-accent': currentSection.accent,
        '--section-glow': currentSection.glow,
        '--section-wash': currentSection.wash,
        '--drag-offset': `${dragOffset}px`,
        '--scale-progress': currentPage / (SECTIONS.length - 1),
      }}
      onPointerMove={handlePointerMove}
    >
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

      <ImmersionCanvas
        accent={currentSection.accent}
        direction={transitionDirection}
        realm={currentSection.realm}
        transitioning={isTransitioning || isDragging}
        reducedMotion={reducedMotion}
      />

      <BoundaryMoment active={boundaryActive} returning={boundaryReturning} />

      {entryOpen && (
        <div className="entry-gate" role="dialog" aria-modal="true" aria-labelledby="entry-title">
          <div className="entry-orbit entry-orbit-one" aria-hidden="true" />
          <div className="entry-orbit entry-orbit-two" aria-hidden="true" />
          <div className="entry-gate-content">
            <p className="entry-kicker">An interactive journey through power and matter.</p>
            <h1 id="entry-title">Enter the Kardashev Scale</h1>
            <p className="entry-promise">Immersive mode uses sound, fullscreen presentation, reactive motion, and a screen wake lock when your browser supports them.</p>
            <div className="entry-load-state" aria-live="polite">
              {!activeReady && !activeFailed && <span className="media-spinner" aria-hidden="true" />}
              <span>{audioError || (activeFailed ? 'The opening video could not load. You can still enter.' : activeReady ? `${readyCount} of ${SECTIONS.length} videos are ready.` : 'The opening sequence is preparing, but you can enter now.')}</span>
            </div>
            <div className="entry-actions">
              <button type="button" className="entry-primary" onClick={enterImmersive} disabled={soundStarting}>
                {soundStarting ? 'Starting the experience…' : 'Enter immersive'}
              </button>
              <button type="button" onClick={() => enterStandard(true)} disabled={soundStarting}>Enter with sound</button>
              <button type="button" onClick={() => enterStandard(false)} disabled={soundStarting}>Continue muted</button>
            </div>
          </div>
        </div>
      )}

      <div className="interface-chrome" onPointerMove={revealControls}>
        <button className="scale-status" type="button" onClick={() => setMapOpen(true)} aria-expanded={mapOpen} aria-controls="scale-map">
          <span>{String(currentPage + 1).padStart(2, '0')} / {SECTIONS.length}</span>
          <strong>{currentSection.label}</strong>
          <small>{currentSection.scaleLabel}</small>
        </button>

        <button className={`sound-control${soundEnabled ? ' is-on' : ''}`} type="button" onClick={toggleSound} disabled={soundStarting}>
          {soundStarting ? 'Starting…' : soundEnabled ? 'Sound on' : 'Sound off'}
        </button>

        <div className="experience-controls">
          <button type="button" className={detailsVisible ? 'is-active' : ''} onClick={() => { setDetailsVisible((visible) => !visible); revealControls(); }}>
            {detailsVisible ? 'Hide details' : 'Learn'}
          </button>
          <button type="button" className={immersiveMode ? 'is-active' : ''} onClick={toggleImmersive}>
            {immersiveMode ? 'Exit immersive' : 'Immersive'}
          </button>
          {!fullscreenActive && <button type="button" onClick={requestFullscreen}>Fullscreen</button>}
        </div>

        <div className="scale-controls">
          <button type="button" onClick={() => move(-1)} disabled={currentPage === 0} aria-label="Travel toward larger scales">↑</button>
          <button type="button" onClick={() => move(1)} disabled={currentPage === SECTIONS.length - 1} aria-label="Travel toward smaller scales">↓</button>
        </div>

        <ScaleRail currentPage={currentPage} onSelect={goToPage} />
        <p className="journey-hint">Drag or scroll to travel. Hold the background to clear the view.</p>
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
        onPointerDown={handlePointerDown}
        onPointerUp={finishPointerGesture}
        onPointerCancel={finishPointerGesture}
      >
        <div
          className="cinematic-track"
          style={{ transform: `translate3d(0, calc(-${currentPage * 100}dvh + var(--drag-offset)), 0)` }}
        >
          {SECTIONS.map((section, index) => {
            const active = index === currentPage;
            const ready = readyVideos.has(index);
            const failed = failedVideos.has(index);
            const distance = Math.abs(index - currentPage);
            const shouldLoad = mediaWindow.has(index);
            return (
              <section
                className={`scale-section realm-${section.realm}${active ? ' is-active' : ''}${ready ? ' has-ready-video' : ''}${index < currentPage ? ' is-before' : ' is-after'}`}
                id={section.id}
                key={section.id}
                aria-hidden={!active}
                style={{
                  '--local-accent': section.accent,
                  '--local-glow': section.glow,
                  '--local-wash': section.wash,
                }}
              >
                <BackgroundVideo
                  src={section.video}
                  active={active}
                  shouldLoad={shouldLoad}
                  preload={distance <= 1 ? 'auto' : 'metadata'}
                  videoRef={(element) => {
                    videoRefs.current[index] = element;
                    if (element?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markVideoReady(index);
                  }}
                  onReady={() => markVideoReady(index)}
                  onError={() => markVideoFailed(index)}
                />
                <div className="video-vignette" />
                <div className="section-atmosphere" aria-hidden="true" />
                {!ready && active && <LoadingIndicator failed={failed} onRetry={() => retryVideo(index)} />}
                <div className={`section-content${active && contentReady ? ' is-content-ready' : ''}${detailsVisible ? ' is-details-visible' : ''}`}>
                  <div className="section-classification">
                    <span>{section.classification}</span>
                    <strong>{section.scaleLabel}</strong>
                  </div>
                  <section.Content />
                  <p className="scale-comparison"><span>What changes at this scale</span>{section.comparison}</p>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="transition-lens" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="transition-flare" aria-hidden="true" />
    </main>
  );
}
