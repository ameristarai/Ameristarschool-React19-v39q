/**
 * PandaGame.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Animated red-panda canvas game rendered on the 404 Not Found page.
 *
 * The component mounts a full-viewport <canvas> (via a fixed-position wrapper
 * in NotFound.tsx) and runs a requestAnimationFrame loop. All entity state is
 * stored in refs to avoid React re-renders during the game loop.
 *
 * Interactions
 *   - Desktop: pandas react to mouse cursor movements
 *   - Mobile / Tablet: touch events (touchstart + touchmove) drive the same
 *     cursor-position logic, with { passive: true } for smooth scroll performance
 *
 * Cleanup
 *   - cancelAnimationFrame called on unmount
 *   - All event listeners removed via stored references (no anonymous-function leak)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef } from 'react';
import { Vector2, PandaEntity, PandaState } from '../types';

// ── Game configuration ────────────────────────────────────────────
const PANDA_COUNT       = 2;
const MOUSE_IDLE_THRESHOLD = 2000; // ms of no movement before cursor is "gone"
// NOTE: pandas begin the sit→sleep sequence after timeUntilBored ms (~20–25 s),
// then fall fully asleep after timeUntilSleep ms (~7–10 s). Total ≈ 30 s.
const PANDA_SPEED       = 2.8;
const PANDA_TURN_SPEED  = 0.08;
const PERSONAL_SPACE    = 100;     // px; minimum separation between pandas

// ── Colour palette (red panda) ────────────────────────────────────
const C_COAT       = '#C25936';
const C_BELLY      = '#4B2E24';
const C_BELLY_LIGHT = '#6B4234'; // Lighter belly for the small panda
const C_TAIL_STRIPE = '#5E3529';
const C_WHITE      = '#F4E7D9';
const C_NOSE       = '#2D1E1A';
const C_INNER_EAR  = '#5E3529';

export const PandaGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation loop handle
  const requestRef        = useRef<number>(0);
  const lastTimeRef       = useRef<number>(0);

  // Cursor / touch position and presence
  const mouseRef              = useRef<Vector2 | null>(null);
  const isMouseInsideRef      = useRef<boolean>(false);
  const lastMouseMoveTimeRef  = useRef<number>(0);

  // Game entities
  const pandasRef = useRef<PandaEntity[]>([]);

  // ── Utility ───────────────────────────────────────────────────
  const lerp = (start: number, end: number, t: number) =>
    start * (1 - t) + end * t;

  // ── Initialise pandas ─────────────────────────────────────────
  const initPandas = (width: number, height: number) => {
    const pandas: PandaEntity[] = [];

    /** Panda 0 — the large one */
    pandas.push({
      id: 0,
      position:  { x: width * 0.3,  y: height * 0.5 },
      velocity:  { x: 0, y: 0 },
      target:    { x: width * 0.3,  y: height * 0.5 },
      state:     PandaState.IDLE,
      stateTimer: 0,
      fatigue:   0,
      legPhase:  Math.random() * Math.PI * 2,
      hopOffset: 0,
      hopPhase:  0,
      headAngle: 0,
      facingDir: 1,
      color:          C_COAT,
      bellyColor:     C_BELLY,
      hasChestPatch:      true,
      hasWhiteTailTip:    false,
      scale:            1.15,
      speedVariance:    1.0,
      wallStuckTimer:   0,
      timeUntilBored:   20000 + Math.random() * 5000,  // 20–25 s; +timeUntilSleep ≈ 30 s total
      timeUntilSleep:   7000  + Math.random() * 3000,
      alertDuration:    1000  + Math.random() * 2000,
      startledDuration: 2000  + Math.random() * 1000,
      isBored:          false,
      ignoreMouseTimer: 0,
    });

    /** Panda 1 — the small one */
    pandas.push({
      id: 1,
      position:  { x: width * 0.7,  y: height * 0.5 },
      velocity:  { x: 0, y: 0 },
      target:    { x: width * 0.7,  y: height * 0.5 },
      state:     PandaState.IDLE,
      stateTimer: 0,
      fatigue:   0,
      legPhase:  Math.random() * Math.PI * 2,
      hopOffset: 0,
      hopPhase:  0,
      headAngle: 0,
      facingDir: -1,
      color:          C_COAT,
      bellyColor:     C_BELLY_LIGHT,
      hasChestPatch:      false,
      hasWhiteTailTip:    true,
      scale:            0.85,
      speedVariance:    0.8,
      wallStuckTimer:   0,
      timeUntilBored:   20000 + Math.random() * 5000,  // 20–25 s; +timeUntilSleep ≈ 30 s total
      timeUntilSleep:   7000  + Math.random() * 3000,
      alertDuration:    1000  + Math.random() * 2000,
      startledDuration: 2000  + Math.random() * 1000,
      isBored:          false,
      ignoreMouseTimer: 0,
    });

    pandasRef.current = pandas;
  };

  // ── Update (state machine + physics) ─────────────────────────
  const update = (timestamp: number, width: number, height: number) => {
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    const mouse             = mouseRef.current;
    const timeSinceMouseMove = Date.now() - lastMouseMoveTimeRef.current;
    const isMouseActive     = isMouseInsideRef.current && mouse !== null &&
                              timeSinceMouseMove < MOUSE_IDLE_THRESHOLD;

    pandasRef.current.forEach((panda, index) => {
      const otherPanda = pandasRef.current.find(p => p.id !== panda.id);

      // ── Timers ──────────────────────────────────────────────
      if (panda.ignoreMouseTimer > 0) {
        panda.ignoreMouseTimer -= deltaTime;
      }

      // ── Interrupts: cursor appearance wakes idle pandas ─────
      if (
        isMouseActive &&
        panda.ignoreMouseTimer <= 0 &&
        panda.state !== PandaState.CHASE &&
        panda.state !== PandaState.ALERT &&
        panda.state !== PandaState.STARTLED
      ) {
        if (
          panda.state === PandaState.SLEEPING ||
          (panda.state === PandaState.SITTING && panda.isBored)
        ) {
          panda.state     = PandaState.STARTLED;
          panda.stateTimer = 0;
          panda.isBored   = false;
        } else if (panda.state === PandaState.SITTING) {
          if (Math.random() < 0.05) {
            panda.state     = PandaState.ALERT;
            panda.stateTimer = 0;
          }
        } else {
          panda.state     = PandaState.ALERT;
          panda.stateTimer = 0;
        }
      }

      // ── Boredom: sit/sleep when cursor absent too long ───────
      if (
        !isMouseActive &&
        !panda.isBored &&
        timeSinceMouseMove > panda.timeUntilBored
      ) {
        if (
          panda.state !== PandaState.SLEEPING &&
          panda.state !== PandaState.SITTING
        ) {
          panda.state     = PandaState.SITTING;
          panda.stateTimer = 0;
          panda.isBored   = true;
        }
      }

      panda.stateTimer += deltaTime;

      // ── State machine ────────────────────────────────────────
      switch (panda.state) {

        case PandaState.STARTLED:
          panda.velocity.x *= 0.8;
          panda.velocity.y *= 0.8;
          if (panda.stateTimer > panda.startledDuration) {
            panda.state     = PandaState.CHASE;
            panda.stateTimer = 0;
          }
          break;

        case PandaState.ALERT:
          panda.velocity.x *= 0.85;
          panda.velocity.y *= 0.85;
          if (panda.stateTimer > panda.alertDuration) {
            panda.state     = PandaState.CHASE;
            panda.stateTimer = 0;
          }
          break;

        case PandaState.CHASE:
          panda.fatigue += 0.05;
          if (!isMouseActive || !isMouseInsideRef.current) {
            panda.state     = PandaState.IDLE;
            panda.stateTimer = 0;
          } else if (mouse) {
            const offsetX  = (index === 0 ? -60 : 60);
            panda.target   = { x: mouse.x + offsetX, y: mouse.y + 30 };
          }
          break;

        case PandaState.PLAYING:
          panda.fatigue += 0.03;
          if (otherPanda) {
            const t = timestamp * 0.002;
            panda.target = {
              x: otherPanda.position.x + Math.sin(t + index) * 60,
              y: otherPanda.position.y + Math.cos(t + index) * 60,
            };
          }
          if (panda.fatigue > 80 || (panda.stateTimer > 4000 && Math.random() < 0.005)) {
            panda.state     = PandaState.IDLE;
            panda.stateTimer = 0;
          }
          break;

        case PandaState.IDLE: {
          panda.fatigue += 0.01;
          const distToTarget = Math.hypot(
            panda.target.x - panda.position.x,
            panda.target.y - panda.position.y,
          );
          if (distToTarget < 50) {
            const rand = Math.random();
            if (panda.fatigue > 70 && rand < 0.6) {
              panda.state = rand < 0.3 ? PandaState.SLEEPING : PandaState.SITTING;
            } else if (otherPanda && rand < 0.4) {
              panda.state = PandaState.PLAYING;
            } else {
              panda.target = {
                x: 50 + Math.random() * (width  - 100),
                y: 50 + Math.random() * (height - 100),
              };
            }
            panda.stateTimer = 0;
          }
          break;
        }

        case PandaState.SITTING:
          panda.fatigue     = Math.max(0, panda.fatigue - 0.2);
          panda.velocity.x *= 0.85;
          panda.velocity.y *= 0.85;
          if (panda.isBored) {
            if (panda.stateTimer > panda.timeUntilSleep) {
              panda.state     = PandaState.SLEEPING;
              panda.stateTimer = 0;
            }
          } else {
            if (panda.stateTimer > 3000 && (panda.fatigue < 20 || Math.random() < 0.005)) {
              panda.state     = PandaState.IDLE;
              panda.stateTimer = 0;
            }
            if (panda.stateTimer > 2000 && Math.random() < 0.005) {
              panda.state     = PandaState.SLEEPING;
              panda.stateTimer = 0;
            }
          }
          break;

        case PandaState.SLEEPING:
          panda.fatigue     = Math.max(0, panda.fatigue - 0.4);
          panda.velocity.x *= 0.8;
          panda.velocity.y *= 0.8;
          if (!panda.isBored && panda.fatigue <= 0 && panda.stateTimer > 5000) {
            panda.state     = PandaState.SITTING;
            panda.stateTimer = 0;
          }
          break;
      }

      // ── Physics ──────────────────────────────────────────────
      const isResting =
        panda.state === PandaState.SITTING ||
        panda.state === PandaState.SLEEPING;

      if (!isResting) {
        const dx   = panda.target.x - panda.position.x;
        const dy   = panda.target.y - panda.position.y;
        const dist = Math.hypot(dx, dy);

        let desiredVx = 0;
        let desiredVy = 0;

        if (dist > 15) {
          let speed = PANDA_SPEED * panda.speedVariance;
          if (panda.state === PandaState.CHASE)   speed *= 0.85; // Playful trot, not a sprint (was 1.4)
          if (panda.state === PandaState.PLAYING) speed *= 1.2;
          desiredVx = (dx / dist) * speed;
          desiredVy = (dy / dist) * speed;
        }

        // Personal space — gentle repulsion between the two pandas
        if (otherPanda) {
          const pdx   = panda.position.x - otherPanda.position.x;
          const pdy   = panda.position.y - otherPanda.position.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < PERSONAL_SPACE && panda.state !== PandaState.SLEEPING) {
            const push = (PERSONAL_SPACE - pdist) * 0.03;
            desiredVx += (pdx / pdist) * push;
            desiredVy += (pdy / pdist) * push;
          }
        }

        // Smooth velocity steering
        panda.velocity.x += (desiredVx - panda.velocity.x) * PANDA_TURN_SPEED;
        panda.velocity.y += (desiredVy - panda.velocity.y) * PANDA_TURN_SPEED;
        panda.position.x += panda.velocity.x;
        panda.position.y += panda.velocity.y;

        // Hysteresis prevents facing-direction flicker
        if (Math.abs(panda.velocity.x) > 0.1) {
          panda.facingDir = Math.sign(panda.velocity.x);
        }
      }

      // ── Hop animation ────────────────────────────────────────
      const speed = Math.hypot(panda.velocity.x, panda.velocity.y);
      if (speed > 0.1 && !isResting) {
        panda.legPhase  += speed * 0.2;
        panda.hopOffset  = Math.sin(panda.legPhase * 2) * 2;
      } else {
        panda.hopOffset = lerp(panda.hopOffset, 0, 0.1);
        panda.legPhase  = 0;
      }

      // ── Wall-stuck recovery ───────────────────────────────────
      // Applies to any moving state (not just CHASE) so pandas never
      // pin themselves against any edge for more than 3 seconds.
      const padding = 40;
      const atWall  =
        panda.position.x <= padding ||
        panda.position.x >= width  - padding ||
        panda.position.y <= padding ||
        panda.position.y >= height - padding;

      const isMovingState =
        panda.state === PandaState.CHASE   ||
        panda.state === PandaState.IDLE    ||
        panda.state === PandaState.PLAYING;

      if (atWall && isMovingState) {
        panda.wallStuckTimer += deltaTime;
        if (panda.wallStuckTimer > 3000) {
          // Play with other panda (50%), sit (30%), or sleep (20%)
          const r = Math.random();
          if (r < 0.5 && otherPanda) {
            panda.state = PandaState.PLAYING;
          } else if (r < 0.8) {
            panda.state = PandaState.SITTING;
          } else {
            panda.state = PandaState.SLEEPING;
          }
          // Move target well away from the wall, toward canvas centre
          panda.target = {
            x: width  * 0.2 + Math.random() * width  * 0.6,
            y: height * 0.2 + Math.random() * height * 0.6,
          };
          panda.wallStuckTimer   = 0;
          panda.stateTimer       = 0;
          // 4 s cooldown lets the panda finish its recovery before
          // cursor input can interrupt again (shorter than before since
          // chase speed is now slower)
          panda.ignoreMouseTimer = 4000;
        }
      } else {
        panda.wallStuckTimer = 0;
      }

      // Hard boundary clamp
      panda.position.x = Math.max(padding - 10, Math.min(width  - padding + 10, panda.position.x));
      panda.position.y = Math.max(padding - 10, Math.min(height - padding + 10, panda.position.y));
    });
  };

  // ── Drawing helpers ───────────────────────────────────────────
  const drawEllipse = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    rw: number, rh: number,
    color: string,
    rotation = 0,
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // ── Head (shared across all poses) ───────────────────────────
  const drawHead = (
    ctx: CanvasRenderingContext2D,
    panda: PandaEntity,
    x: number, y: number,
    lookAtCursor: boolean,
  ) => {
    ctx.save();
    ctx.translate(x, y);

    if (lookAtCursor && mouseRef.current && isMouseInsideRef.current) {
      const dx           = mouseRef.current.x - panda.position.x;
      const dy           = mouseRef.current.y - panda.position.y;
      const targetAngle  = Math.atan2(dy, dx * panda.facingDir);
      panda.headAngle    = lerp(
        panda.headAngle,
        Math.max(-0.5, Math.min(0.5, targetAngle)),
        0.1,
      );
    } else {
      panda.headAngle = lerp(panda.headAngle, 0, 0.1);
    }
    ctx.rotate(panda.headAngle);

    // Back ear
    ctx.save();
    ctx.translate(-14, -16);
    ctx.rotate(-0.4);
    ctx.fillStyle = C_WHITE;
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C_INNER_EAR;
    ctx.beginPath(); ctx.ellipse(0, 0, 4, 8,  0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Front ear
    ctx.save();
    ctx.translate(14, -16);
    ctx.rotate(0.4);
    ctx.fillStyle = C_WHITE;
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C_INNER_EAR;
    ctx.beginPath(); ctx.ellipse(0, 0, 4, 8,  0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Face base
    ctx.fillStyle = C_COAT;
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 18, 0, 0, Math.PI * 2); ctx.fill();

    // Cheeks
    ctx.fillStyle = C_WHITE;
    ctx.beginPath(); ctx.ellipse(-11, 5, 10, 8,  0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 11, 5, 10, 8, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(  0, 8,  8, 6,    0, 0, Math.PI * 2); ctx.fill();

    // Eyebrows
    drawEllipse(ctx,  8, -10, 4, 2.5, C_WHITE,  0.2);
    drawEllipse(ctx, -8, -10, 4, 2.5, C_WHITE, -0.2);

    // Eyes
    if (panda.state === PandaState.SLEEPING) {
      ctx.strokeStyle = C_NOSE;
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.arc(-8, -4, 4, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.beginPath(); ctx.arc( 8, -4, 4, 0.1, Math.PI - 0.1); ctx.stroke();
    } else {
      ctx.fillStyle = C_NOSE;
      ctx.beginPath(); ctx.arc(-8, -4, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc( 8, -4, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-7, -5, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc( 9, -5, 1.2, 0, Math.PI * 2); ctx.fill();
    }

    // Nose
    ctx.fillStyle = C_NOSE;
    ctx.beginPath(); ctx.ellipse(0, 4, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();

    // Whiskers
    ctx.strokeStyle   = '#FFFFFF';
    ctx.lineWidth     = 0.5;
    ctx.globalAlpha   = 0.6;
    ctx.beginPath(); ctx.moveTo( 5, 5); ctx.lineTo( 15,  4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 5, 6); ctx.lineTo( 14,  7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, 5); ctx.lineTo(-15,  4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, 6); ctx.lineTo(-14,  7); ctx.stroke();
    ctx.globalAlpha   = 1.0;

    // Mouth
    if (panda.state === PandaState.STARTLED) {
      ctx.fillStyle = '#442222';
      ctx.beginPath(); ctx.arc(0, 9, 3, 0, Math.PI * 2); ctx.fill();
    } else if (panda.state !== PandaState.SLEEPING) {
      ctx.strokeStyle = C_NOSE;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(-3, 8);
      ctx.quadraticCurveTo(0, 10, 3, 8);
      ctx.stroke();
    }

    ctx.restore();
  };

  // ── Pose: Startled ────────────────────────────────────────────
  const drawStartled = (ctx: CanvasRenderingContext2D, panda: PandaEntity) => {
    ctx.save();
    ctx.translate(-20, 30);
    ctx.rotate(-0.8);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, 10, -50, 0);
    ctx.quadraticCurveTo(-20, -10, 0, 0);
    ctx.fillStyle = C_COAT;
    ctx.fill();
    ctx.save(); ctx.clip();
    ctx.lineWidth = 8;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(-10 * i, -10); ctx.lineTo(-10 * i, 10);
      ctx.strokeStyle = (panda.hasWhiteTailTip && i % 2 === 0) ? C_WHITE : C_TAIL_STRIPE;
      ctx.stroke();
    }
    ctx.restore(); ctx.restore();

    ctx.save(); ctx.translate(0, 10);
    ctx.fillStyle = panda.bellyColor;
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 35, 0, 0, Math.PI * 2); ctx.fill();
    if (panda.hasChestPatch) {
      ctx.fillStyle = C_WHITE;
      ctx.beginPath(); ctx.ellipse(0, -15, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    drawEllipse(ctx, -15, 40, 8, 12, panda.bellyColor,  0.2);
    drawEllipse(ctx,  15, 40, 8, 12, panda.bellyColor, -0.2);

    ctx.save(); ctx.translate(-20, -10); ctx.rotate(-0.8);
    drawEllipse(ctx, 0, 0, 7, 15, panda.bellyColor, 0);
    ctx.restore();
    ctx.save(); ctx.translate( 20, -10); ctx.rotate( 0.8);
    drawEllipse(ctx, 0, 0, 7, 15, panda.bellyColor, 0);
    ctx.restore();

    drawHead(ctx, panda, 0, -35, true);
  };

  // ── Pose: Walking ─────────────────────────────────────────────
  const drawWalking = (ctx: CanvasRenderingContext2D, panda: PandaEntity) => {
    // 0.15 = slow, lazy wag independent of walking leg speed (was 0.4)
    const tailCycle = Math.sin(panda.legPhase * 0.15);

    ctx.save();
    ctx.translate(-25, -10 + panda.hopOffset * 0.5);
    ctx.rotate(-0.2 + tailCycle * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-60, -22, -80, -10);
    ctx.quadraticCurveTo(-60,  22,   0, 10);
    ctx.fillStyle = C_COAT; ctx.fill();
    ctx.save(); ctx.clip();
    for (let i = 1; i < 5; i++) {
      const sx = -15 * i - 5;
      ctx.beginPath();
      ctx.moveTo(sx, -30); ctx.quadraticCurveTo(sx - 5, 0, sx, 30);
      ctx.lineWidth   = 10;
      ctx.strokeStyle = (panda.hasWhiteTailTip && i % 2 === 0) ? C_WHITE : C_TAIL_STRIPE;
      ctx.stroke();
    }
    ctx.restore(); ctx.restore();

    const legY = 15;
    const l1   = Math.sin(panda.legPhase + Math.PI) * 0.4;
    const l2   = Math.sin(panda.legPhase)            * 0.4;
    drawEllipse(ctx, -15, legY, 9, 14, panda.bellyColor, l1);
    drawEllipse(ctx,  15, legY, 9, 14, panda.bellyColor, l2);

    ctx.save(); ctx.translate(0, panda.hopOffset);
    ctx.beginPath(); ctx.roundRect(-30, -20, 60, 45, 20);
    ctx.fillStyle = panda.bellyColor; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.rect(-40, -40, 80, 45); ctx.fill();
    if (panda.hasChestPatch) {
      ctx.fillStyle = C_WHITE;
      ctx.beginPath(); ctx.ellipse(20, 0, 8, 12, 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); ctx.restore();

    drawHead(ctx, panda, 35, -15 + panda.hopOffset * 1.2, true);

    drawEllipse(ctx, -12, legY, 9, 14, panda.bellyColor, l2);
    drawEllipse(ctx,  18, legY, 9, 14, panda.bellyColor, l1);
  };

  // ── Pose: Sitting ─────────────────────────────────────────────
  const drawSitting = (ctx: CanvasRenderingContext2D, panda: PandaEntity) => {
    ctx.save();
    ctx.translate(-20, 15); ctx.rotate(-0.5);
    ctx.beginPath(); ctx.ellipse(-20, 0, 30, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = C_COAT; ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 10, 25, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = panda.bellyColor; ctx.fill();
    ctx.clip();
    ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.rect(-30, -20, 60, 25); ctx.fill();
    if (panda.hasChestPatch) {
      ctx.fillStyle = C_WHITE;
      ctx.beginPath(); ctx.ellipse(0, -5, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    drawEllipse(ctx, -20, 25, 8, 12, panda.bellyColor,  0.5);
    drawEllipse(ctx,  20, 25, 8, 12, panda.bellyColor, -0.5);
    drawEllipse(ctx, -10, 10, 6, 14, panda.bellyColor,  0.2);
    drawEllipse(ctx,  10, 10, 6, 14, panda.bellyColor, -0.2);

    drawHead(ctx, panda, 0, -8, true);
  };

  // ── Pose: Sleeping ────────────────────────────────────────────
  const drawSleeping = (ctx: CanvasRenderingContext2D, panda: PandaEntity) => {
    ctx.fillStyle = C_COAT;
    ctx.beginPath(); ctx.ellipse(0, 5, 28, 22, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save(); ctx.rotate(0.2);
    drawHead(ctx, panda, -18, 0, false);
    ctx.restore();

    drawEllipse(ctx, -10, 15, 8, 12, panda.bellyColor,  1.5);
    drawEllipse(ctx,  10, 15, 9, 14, panda.bellyColor, -1.5);

    ctx.save(); ctx.translate(20, 5); ctx.rotate(0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo( 30,  10,  20, 40, -20, 35);
    ctx.bezierCurveTo(-50,  30, -50, 10, -30, 10);
    ctx.bezierCurveTo(-10,  10,   0, 10,   0,  0);
    ctx.fillStyle = C_COAT; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.lineWidth = 10;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(10 - i * 15, 40);
      ctx.quadraticCurveTo(10 - i * 15 + 5, 10, 10 - i * 15, -10);
      ctx.strokeStyle = (panda.hasWhiteTailTip && i % 2 === 0) ? C_WHITE : C_TAIL_STRIPE;
      ctx.stroke();
    }
    ctx.restore(); ctx.restore();

    // Zzz particles
    const zTime = Date.now() / 500;
    ctx.save();
    ctx.scale(panda.facingDir, 1);
    ctx.fillStyle   = '#aaa';
    ctx.font        = 'bold 30px sans-serif';
    ctx.globalAlpha = (Math.sin(zTime) + 1) / 2;
    ctx.fillText('z', 20, -30 - (zTime % 1) * 20);
    ctx.globalAlpha = (Math.cos(zTime) + 1) / 2;
    ctx.fillText('z', 35, -55 - ((zTime + 0.5) % 1) * 20);
    ctx.restore();
  };

  // ── Dispatch draw per entity ──────────────────────────────────
  const drawPanda = (ctx: CanvasRenderingContext2D, panda: PandaEntity) => {
    const { position, scale, facingDir } = panda;

    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale * facingDir, scale);

    // ── Ground shadow ─────────────────────────────────────────
    // For the STARTLED pose the panda stands upright with feet at ~y=40.
    // Drawing the shadow well below the feet (y=64) with reduced opacity
    // creates the visual impression that the panda has jumped off the ground.
    // All other poses use a contact shadow at y=25 (mid-body level).
    if (panda.state === PandaState.STARTLED) {
      // Distant ground shadow — larger radius, more transparent
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.beginPath(); ctx.ellipse(0, 64, 36, 9, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      // Normal contact shadow
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath(); ctx.ellipse(0, 25, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Alert / Startled exclamation
    if (panda.state === PandaState.STARTLED || panda.state === PandaState.ALERT) {
      ctx.save(); ctx.scale(facingDir, 1);
      ctx.fillStyle = '#E74C3C';
      ctx.font      = 'bold 60px sans-serif';
      ctx.fillText('!', -10, -60);
      ctx.restore();
    }

    if      (panda.state === PandaState.SLEEPING)  drawSleeping(ctx, panda);
    else if (panda.state === PandaState.SITTING)   drawSitting(ctx, panda);
    else if (panda.state === PandaState.STARTLED)  drawStartled(ctx, panda);
    else                                            drawWalking(ctx, panda);

    ctx.restore();
  };

  // ── Animation loop ────────────────────────────────────────────
  const drawLoop = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx)   return;

    // Keep canvas pixel size matched to viewport
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update(timestamp, canvas.width, canvas.height);

    // Draw back-to-front by y position (simple depth sort)
    [...pandasRef.current]
      .sort((a, b) => a.position.y - b.position.y)
      .forEach(panda => drawPanda(ctx, panda));

    requestRef.current = requestAnimationFrame(drawLoop);
  };

  // ── Mount / unmount ───────────────────────────────────────────
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width  = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      initPandas(window.innerWidth, window.innerHeight);
    }

    requestRef.current = requestAnimationFrame(drawLoop);

    // ── Event handlers (stored for proper cleanup) ─────────────
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current            = { x: e.clientX, y: e.clientY };
      lastMouseMoveTimeRef.current = Date.now();
      isMouseInsideRef.current     = true;
    };

    const handleMouseLeave  = () => { isMouseInsideRef.current = false; };
    const handleMouseEnter  = () => { isMouseInsideRef.current = true;  };

    /**
     * Unified touch handler for both touchstart and touchmove.
     * passive: true lets the browser handle native scroll while still
     * reading touch coordinates for panda interaction.
     */
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        mouseRef.current            = { x: touch.clientX, y: touch.clientY };
        lastMouseMoveTimeRef.current = Date.now();
        isMouseInsideRef.current     = true;
      }
    };

    const handleTouchEnd = () => { isMouseInsideRef.current = false; };

    window.addEventListener('mousemove',   handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // passive: true — lets the browser handle scroll gestures natively (best mobile performance)
    window.addEventListener('touchstart', handleTouch,  { passive: true });
    window.addEventListener('touchmove',  handleTouch,  { passive: true });
    window.addEventListener('touchend',   handleTouchEnd);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove',   handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('touchstart',  handleTouch);
      window.removeEventListener('touchmove',   handleTouch);
      window.removeEventListener('touchend',    handleTouchEnd);
    };
    // drawLoop reads only refs — intentionally excluded from deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block touch-none"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
};
