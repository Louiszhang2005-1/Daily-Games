"use client";

import { useMemo } from "react";
import s from "./expedition.module.css";

// A tall world the player travels through: down into the ocean (Rare Answers) or up into
// the sky (Common Answers). Solid colour zones, a ruler with facts, and a camera that
// follows the mascot as the score grows.

export interface Zone {
  from: number; // metres
  to: number;
  name: string;
  color: string;
}

export interface Fact {
  at: number; // metres
  text: string;
}

export interface SceneConfig {
  mode: "dive" | "climb";
  zones: Zone[];
  facts: Fact[];
  maxMeters: number;
  metersPerPoint: number;
  edge: { color: string; label: string }; // sky above the surface, or ground below the start
  mascot: React.ReactNode;
}

const WORLD_PX = 3600; // height of the whole world
const EDGE_PX = 260; // sky (dive) or ground (climb) shown before metre 0

export function Expedition({
  scene,
  meters,
  hud,
  overlay,
  dock,
}: {
  scene: SceneConfig;
  meters: number;
  hud: React.ReactNode;
  overlay: React.ReactNode;
  dock: React.ReactNode;
}) {
  const dive = scene.mode === "dive";
  const span = WORLD_PX - EDGE_PX;
  // y position (from the world's top) for a depth/altitude in metres. A square-root scale
  // gives the first few hundred metres room, so every answer visibly moves you.
  const dist = (m: number) => Math.sqrt(Math.max(0, m) / scene.maxMeters) * span;
  const y = (m: number) => (dive ? EDGE_PX + dist(m) : WORLD_PX - EDGE_PX - dist(m));
  const mascotY = y(Math.min(meters, scene.maxMeters));

  const ticks = useMemo(() => [0, 100, 250, 500, 1000, 2000, 3000, 4000, 6000, 8000, 10000].filter((m) => m <= scene.maxMeters), [scene.maxMeters]);

  return (
    <div className={`${s.viewport} ${dive ? s.dive : s.climb}`} style={{ ["--edge" as string]: scene.edge.color }}>
      {/* The moving world. The camera keeps the mascot about 45% down the viewport. */}
      <div className={s.world} style={{ height: WORLD_PX, transform: `translateY(calc(var(--vh) * 0.45 - ${mascotY}px))` }}>
        <div className={s.edge} style={dive ? { top: 0, height: EDGE_PX } : { bottom: 0, height: EDGE_PX }}>
          <span className={s.edgeLabel}>{scene.edge.label}</span>
        </div>
        {scene.zones.map((z) => {
          const top = Math.min(y(z.from), y(z.to));
          const height = Math.abs(y(z.to) - y(z.from));
          return (
            <div key={z.name} className={s.zone} style={{ top, height, background: z.color }}>
              <span className={s.zoneName}>{z.name}</span>
            </div>
          );
        })}
        <div className={s.surfaceLine} style={{ top: y(0) }} />

        {/* Ruler */}
        <div className={s.ruler}>
          {ticks.map((m) => (
            <span key={m} className={s.tick} style={{ top: y(m) }}>
              {dive && m > 0 ? `-${m.toLocaleString()} m` : `${m.toLocaleString()} m`}
            </span>
          ))}
          {scene.facts.map((f) => (
            <span key={f.at} className={s.fact} style={{ top: y(f.at) }}>
              {f.text}
            </span>
          ))}
        </div>

        <div className={s.mascot} style={{ top: mascotY }}>
          {scene.mascot}
        </div>
      </div>

      <div className={s.hud}>{hud}</div>
      <div className={s.overlay}>{overlay}</div>
      <div className={s.dock}>{dock}</div>
    </div>
  );
}

/** Circular countdown shown in the answer dock. */
export function TimerRing({ left, total }: { left: number; total: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, left / total));
  const secs = Math.ceil(left / 1000);
  return (
    <span className={`${s.ring} ${secs <= 5 ? s.ringLow : ""}`} aria-label={`${secs} seconds left`}>
      <svg viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} className={s.ringTrack} />
        <circle cx="26" cy="26" r={r} className={s.ringBar} strokeDasharray={c} strokeDashoffset={c * (1 - frac)} />
      </svg>
      <span>{secs}</span>
    </span>
  );
}

export const sceneStyles = s;
