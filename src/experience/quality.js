export const QUALITY_TIERS = {
  ultra: {
    dpr: [1.1, 2], stars: 9000, galaxyStars: 68000, dysonCollectors: 2600,
    cosmicGalaxies: 5200, microParticles: 18000, earthInfrastructure: 520,
    networkNodes: 56, habitats: 42, latticeAtoms: 620, dnaPairs: 220,
    moleculeAtoms: 72, nucleons: 150, particleTracks: 56, multiverseBubbles: 28,
    realityShells: 24, heroSegments: 160, gridStep: 0.72, bloom: 0.48,
    multisampling: 4, shadows: true,
  },
  high: {
    dpr: [1, 1.7], stars: 6500, galaxyStars: 48000, dysonCollectors: 1800,
    cosmicGalaxies: 3600, microParticles: 12000, earthInfrastructure: 360,
    networkNodes: 44, habitats: 30, latticeAtoms: 520, dnaPairs: 180,
    moleculeAtoms: 60, nucleons: 126, particleTracks: 44, multiverseBubbles: 22,
    realityShells: 20, heroSegments: 128, gridStep: 0.82, bloom: 0.42,
    multisampling: 2, shadows: true,
  },
  balanced: {
    dpr: [0.9, 1.35], stars: 4200, galaxyStars: 30000, dysonCollectors: 1050,
    cosmicGalaxies: 2300, microParticles: 7000, earthInfrastructure: 220,
    networkNodes: 34, habitats: 20, latticeAtoms: 420, dnaPairs: 130,
    moleculeAtoms: 48, nucleons: 98, particleTracks: 32, multiverseBubbles: 16,
    realityShells: 16, heroSegments: 96, gridStep: 0.95, bloom: 0.34,
    multisampling: 0, shadows: false,
  },
  safe: {
    dpr: [0.75, 1], stars: 2400, galaxyStars: 17000, dysonCollectors: 520,
    cosmicGalaxies: 1200, microParticles: 3200, earthInfrastructure: 110,
    networkNodes: 24, habitats: 12, latticeAtoms: 280, dnaPairs: 84,
    moleculeAtoms: 34, nucleons: 72, particleTracks: 22, multiverseBubbles: 10,
    realityShells: 12, heroSegments: 72, gridStep: 1.2, bloom: 0.24,
    multisampling: 0, shadows: false,
  },
};

export function detectQualityTier() {
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  if (reducedMotion || memory <= 2 || cores <= 2) return 'safe';
  if (mobile || memory <= 4 || cores <= 4) return 'balanced';
  if (memory >= 8 && cores >= 8) return 'ultra';
  return 'high';
}

export function getQualityProfile(tier) {
  return QUALITY_TIERS[tier] || QUALITY_TIERS.high;
}
