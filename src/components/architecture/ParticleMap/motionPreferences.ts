// motionPreferences.ts - prefers-reduced-motion reader → motion profile
// STAGE: particle_motion
// WHY: Adjusts animation intensity based on user accessibility preferences (FR-015)
// HOW: Reads media query once (+ listens for changes) and returns a profile

// ─────────────────────────────────────────────────────────────────────────────
// MotionProfile - Animation intensity parameters
// ─────────────────────────────────────────────────────────────────────────────
export interface MotionProfile {
  driftAmplitude: number   // How far bubbles drift (0 = static, 1 = full)
  particleSpeed: number    // Speed multiplier for directional particles
  cameraMs: number         // Duration for camera animations (ms)
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT_PROFILE - Standard motion (no reduced motion preference)
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_PROFILE: MotionProfile = {
  driftAmplitude: 1.0,
  particleSpeed: 1.0,
  cameraMs: 800,
}

// ─────────────────────────────────────────────────────────────────────────────
// REDUCED_PROFILE - Calm motion for reduced-motion preference
// ─────────────────────────────────────────────────────────────────────────────
const REDUCED_PROFILE: MotionProfile = {
  driftAmplitude: 0.1,
  particleSpeed: 0.2,
  cameraMs: 0, // instant cuts
}

// ─────────────────────────────────────────────────────────────────────────────
// readMotionPreference - Reads media query and returns appropriate profile
// ─────────────────────────────────────────────────────────────────────────────
export function readMotionPreference(query: MediaQueryList): MotionProfile {
  return query.matches ? REDUCED_PROFILE : DEFAULT_PROFILE
}