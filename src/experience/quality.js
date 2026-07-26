export const QUALITY_TIERS = {
  ultra: {
    dpr: [1.25, 2.5],
    stars: 18000,
    galaxyStars: 110000,
    dysonCollectors: 5600,
    cosmicNodes: 520,
    microParticles: 52000,
    bloom: 0.56,
    multisampling: 8,
    shadows: true,
  },
  high: {
    dpr: [1, 2],
    stars: 12000,
    galaxyStars: 72000,
    dysonCollectors: 3400,
    cosmicNodes: 360,
    microParticles: 32000,
    bloom: 0.48,
    multisampling: 4,
    shadows: true,
  },
  balanced: {
    dpr: [1, 1.6],
    stars: 7000,
    galaxyStars: 44000,
    dysonCollectors: 1900,
    cosmicNodes: 240,
    microParticles: 19000,
    bloom: 0.4,
    multisampling: 0,
    shadows: false,
  },
  safe: {
    dpr: [0.85, 1.25],
    stars: 3800,
    galaxyStars: 24000,
    dysonCollectors: 900,
    cosmicNodes: 150,
    microParticles: 10000,
    bloom: 0.3,
    multisampling: 0,
    shadows: false,
  },
};

export function detectQualityTier() {
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const dpr = window.devicePixelRatio || 1;

  if (reducedMotion || memory <= 2 || cores <= 2) return 'safe';
  if (mobile || memory <= 4 || cores <= 4) return 'balanced';
  if (memory >= 8 && cores >= 8 && dpr <= 2.5) return 'ultra';
  return 'high';
}

export function getQualityProfile(tier) {
  return QUALITY_TIERS[tier] || QUALITY_TIERS.high;
}
