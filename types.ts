export enum Page {
  Home = 'HOME',
  About = 'ABOUT',
  Courses = 'COURSES',
  Contact = 'CONTACT',
  Privacy = 'PRIVACY',
  Terms = 'TERMS',
  Sitemap = 'SITEMAP',
  Enrollment = 'ENROLLMENT',
  Roadmap = 'ROADMAP',
  Forms = 'FORMS',
  NotFound = 'NOT_FOUND',
}

export interface CourseData {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface TestimonialData {
  id: string;
  author: string;
  role: string;
  quote: string;
}

// ─────────────────────────────────────────────────────────────────
// PANDA GAME TYPES (used by components/PandaGame.tsx on the 404 page)
// ─────────────────────────────────────────────────────────────────

export interface Vector2 {
  x: number;
  y: number;
}

/** All possible behavioral states for a red panda entity. */
export enum PandaState {
  IDLE      = 'IDLE',      // Wandering randomly
  PLAYING   = 'PLAYING',   // Chasing each other
  SITTING   = 'SITTING',   // Sitting down (resting)
  SLEEPING  = 'SLEEPING',  // Curled up (deep rest)
  ALERT     = 'ALERT',     // Noticed the cursor — pausing briefly
  STARTLED  = 'STARTLED',  // Standing on hind legs, paws up!
  CHASE     = 'CHASE',     // Actively chasing the cursor
}

/** Full state object for a single red panda character on the canvas. */
export interface PandaEntity {
  id: number;
  position: Vector2;
  velocity: Vector2;
  target: Vector2;
  state: PandaState;
  stateTimer: number;       // Milliseconds spent in current state
  fatigue: number;          // 0–100; increases with activity, decreases at rest

  hopOffset: number;        // Vertical pixel offset for hop animation
  hopPhase: number;         // Sine-wave phase for hop cycle

  color: string;            // Main fur color
  bellyColor: string;       // Belly / leg color
  hasChestPatch: boolean;   // White patch on chest
  hasWhiteTailTip: boolean; // White bands on tail
  scale: number;            // Size multiplier (0.85 = small, 1.15 = large)
  legPhase: number;         // Animation phase for walking legs
  headAngle: number;        // Head rotation angle (radians) when tracking cursor
  facingDir: number;        // 1 = facing right, −1 = facing left

  speedVariance: number;    // Per-panda speed multiplier (0.8–1.2)
  wallStuckTimer: number;   // Milliseconds pressed against a boundary wall
  timeUntilBored: number;   // Random threshold (ms) to sit if no cursor activity
  timeUntilSleep: number;   // Random threshold (ms) to sleep after sitting
  alertDuration: number;    // Random duration (ms) to pause before chasing
  startledDuration: number; // Duration (ms) for the startled stand-up pose
  isBored: boolean;         // True when in the autonomous bored→sleep sequence
  ignoreMouseTimer: number; // Cooldown (ms) to ignore cursor after a wall bump
}