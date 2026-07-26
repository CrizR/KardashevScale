import React, { useEffect, useRef } from 'react';

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function createParticle() {
  return {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random() * 0.92 + 0.08,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.5 + 0.55,
    size: Math.random() * 1.4 + 0.35,
  };
}

export default function ImmersionCanvas({ accent, direction, realm, transitioning, reducedMotion }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ direction, realm, transitioning, accent, reducedMotion });

  useEffect(() => {
    stateRef.current = { direction, realm, transitioning, accent, reducedMotion };
  }, [accent, direction, realm, reducedMotion, transitioning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    let frame = 0;
    let width = 0;
    let height = 0;
    let lastTime = performance.now();
    let lastDraw = 0;
    let visible = !document.hidden;
    const pointer = { x: 0, y: 0 };
    const particles = Array.from(
      { length: window.innerWidth < 700 ? 54 : 96 },
      createParticle,
    );

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const handlePointerMove = (event) => {
      pointer.x = (event.clientX / Math.max(width, 1) - 0.5) * 2;
      pointer.y = (event.clientY / Math.max(height, 1) - 0.5) * 2;
    };

    const handleVisibilityChange = () => {
      visible = !document.hidden;
      if (visible) {
        lastTime = performance.now();
        frame = window.requestAnimationFrame(draw);
      }
    };

    const resetParticle = (particle, far = true) => {
      particle.x = Math.random() * 2 - 1;
      particle.y = Math.random() * 2 - 1;
      particle.z = far ? 1 : Math.random() * 0.92 + 0.08;
      particle.phase = Math.random() * Math.PI * 2;
      particle.speed = Math.random() * 0.5 + 0.55;
      particle.size = Math.random() * 1.4 + 0.35;
    };

    const drawWarpedGrid = (rgb, intensity, time) => {
      const centerX = width * (0.5 + pointer.x * 0.025);
      const centerY = height * (0.5 + pointer.y * 0.025);
      const spacing = Math.max(46, Math.min(width, height) * 0.085);

      context.save();
      context.globalCompositeOperation = 'screen';
      context.lineWidth = 0.75;
      context.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.08 + intensity * 0.1})`;

      for (let index = -10; index <= 10; index += 1) {
        context.beginPath();
        for (let step = 0; step <= 36; step += 1) {
          const progress = step / 36;
          const x = progress * width;
          const distance = (x - centerX) / Math.max(width, 1);
          const bend = Math.exp(-distance * distance * 12) * Math.sin(time * 0.00045 + index * 0.44) * 32 * intensity;
          const y = centerY + index * spacing + bend;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }

      for (let index = -12; index <= 12; index += 1) {
        context.beginPath();
        for (let step = 0; step <= 28; step += 1) {
          const progress = step / 28;
          const y = progress * height;
          const distance = (y - centerY) / Math.max(height, 1);
          const bend = Math.exp(-distance * distance * 12) * Math.cos(time * 0.00038 + index * 0.42) * 26 * intensity;
          const x = centerX + index * spacing + bend;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }

      const radius = Math.min(width, height) * (0.09 + intensity * 0.035);
      const halo = context.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 2.8);
      halo.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.04 + intensity * 0.08})`);
      halo.addColorStop(0.38, 'rgba(0, 0, 0, 0)');
      halo.addColorStop(0.43, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.18 + intensity * 0.12})`);
      halo.addColorStop(0.49, 'rgba(0, 0, 0, 0)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = halo;
      context.fillRect(0, 0, width, height);
      context.restore();
    };

    const draw = (time) => {
      if (!visible) return;

      const current = stateRef.current;
      const minimumFrameTime = current.reducedMotion ? 1000 / 24 : 0;
      if (time - lastDraw < minimumFrameTime) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      lastDraw = time;

      const delta = Math.min(40, time - lastTime);
      lastTime = time;
      const rgb = hexToRgb(current.accent || '#d7b6ff');
      const intensity = current.transitioning ? 1 : 0.28;
      const speedMultiplier = current.reducedMotion ? 0.28 : 1;
      const directionalSign = current.direction === 'outward' ? 1 : -1;

      context.clearRect(0, 0, width, height);
      context.save();
      context.globalCompositeOperation = 'lighter';

      const centerX = width * (0.5 + pointer.x * 0.035);
      const centerY = height * (0.5 + pointer.y * 0.035);

      particles.forEach((particle) => {
        const previousZ = particle.z;
        const baseSpeed = current.transitioning ? 0.00115 : 0.00016;
        const macroMotion = current.realm === 'macro' || current.realm === 'speculative';

        if (macroMotion) {
          particle.z -= delta * baseSpeed * particle.speed * speedMultiplier * directionalSign;
          if (particle.z < 0.035) resetParticle(particle, true);
          if (particle.z > 1.08) {
            resetParticle(particle, false);
            particle.z = 0.055;
          }

          const scale = Math.min(width, height) * 0.42;
          const x = centerX + (particle.x / particle.z) * scale;
          const y = centerY + (particle.y / particle.z) * scale;
          const previousX = centerX + (particle.x / previousZ) * scale;
          const previousY = centerY + (particle.y / previousZ) * scale;
          const alpha = Math.max(0, Math.min(0.76, (1 - particle.z) * 0.64 + 0.08));

          context.beginPath();
          context.moveTo(previousX, previousY);
          context.lineTo(x, y);
          context.lineWidth = particle.size * (current.transitioning ? 1.2 : 0.55);
          context.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * intensity})`;
          context.stroke();

          context.beginPath();
          context.arc(x, y, particle.size * (1.16 - particle.z), 0, Math.PI * 2);
          context.fillStyle = `rgba(255, 255, 255, ${alpha * 0.82})`;
          context.fill();
        } else {
          particle.phase += delta * 0.00018 * particle.speed * speedMultiplier * (current.transitioning ? 3.5 : 1);
          const radialDirection = current.direction === 'inward' ? -1 : 1;
          particle.z += delta * 0.000045 * radialDirection * speedMultiplier * (current.transitioning ? 3 : 1);
          if (particle.z < 0.04 || particle.z > 1.04) resetParticle(particle, radialDirection < 0);

          const radius = particle.z * Math.min(width, height) * 0.48;
          const wobble = Math.sin(particle.phase * 1.7) * 0.12;
          const x = centerX + Math.cos(particle.phase + particle.x * 2.4) * radius * (0.65 + wobble);
          const y = centerY + Math.sin(particle.phase + particle.y * 2.4) * radius * 0.52;
          const alpha = (1 - particle.z * 0.72) * (0.24 + intensity * 0.44);

          context.beginPath();
          context.arc(x, y, particle.size * (current.transitioning ? 1.8 : 1), 0, Math.PI * 2);
          context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
          context.fill();
        }
      });

      context.restore();

      if (current.realm === 'speculative') {
        drawWarpedGrid(rgb, intensity, time);
      } else if (current.realm === 'micro') {
        const ringCount = current.transitioning ? 4 : 2;
        context.save();
        context.globalCompositeOperation = 'screen';
        for (let index = 0; index < ringCount; index += 1) {
          const phase = (time * 0.00025 + index / ringCount) % 1;
          const radius = phase * Math.min(width, height) * 0.36;
          context.beginPath();
          context.arc(centerX, centerY, radius, 0, Math.PI * 2);
          context.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(1 - phase) * 0.12 * intensity})`;
          context.lineWidth = 1;
          context.stroke();
        }
        context.restore();
      }

      frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="immersion-canvas" aria-hidden="true" />;
}
