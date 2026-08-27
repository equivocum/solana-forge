// spineParticles.ts - Lifecycle-path particle stream config + custom painter accents
// STAGE: particle_painting
// WHY: Visualizes transaction flow along the submission-to-finalization path (FR-004)
// HOW: Configures force-graph linkDirectionalParticles for spine edges

// ─────────────────────────────────────────────────────────────────────────────
// SPINE_PARTICLE_CONFIG - Configuration for directional particles
// ─────────────────────────────────────────────────────────────────────────────
export const SPINE_PARTICLE_CONFIG = {
  speed: 0.5,          //粒子移动速度 (scaled by MotionProfile)
  width: 2,            //粒子宽度
  color: '#fbbf24',    //金色 (matches lifecycle color)
  count: 3,            //每条脊柱链接上的粒子数
}

// ─────────────────────────────────────────────────────────────────────────────
// scaleByMotion - Adjusts config based on motion profile
// ─────────────────────────────────────────────────────────────────────────────
export function scaleByMotion(profile: { particleSpeed: number }) {
  return {
    ...SPINE_PARTICLE_CONFIG,
    speed: SPINE_PARTICLE_CONFIG.speed * profile.particleSpeed,
  }
}