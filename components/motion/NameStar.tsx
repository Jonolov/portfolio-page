"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

const starPath =
  "M300,120 L341,244 L471,244 L366,321 L406,446 L300,369 L194,446 L234,321 L129,244 L259,244 Z";

function sparklePath(cx: number, cy: number, r: number) {
  const k = r * 0.22;
  return `M${cx},${cy - r} C ${cx + k},${cy - k} ${cx + k},${cy - k} ${cx + r},${cy} C ${cx + k},${cy + k} ${cx + k},${cy + k} ${cx},${cy + r} C ${cx - k},${cy + k} ${cx - k},${cy + k} ${cx - r},${cy} C ${cx - k},${cy - k} ${cx - k},${cy - k} ${cx},${cy - r} Z`;
}

const sparkles = [
  { cx: 490, cy: 150, r: 10, duration: "3.2s", delay: "0s" },
  { cx: 150, cy: 400, r: 7, duration: "4s", delay: "1.1s" },
  { cx: 500, cy: 420, r: 6, duration: "3.6s", delay: "2.1s" },
  { cx: 90, cy: 180, r: 5, duration: "4.4s", delay: "0.6s" },
];

const BASE_DEGREES_PER_SECOND = 360 / 140;
const MAX_DEGREES_PER_SECOND = 30;
// Star sits in the hero's upper-right; approximate its center in the same
// -0.5..0.5 normalized space the section already tracks cursor position in.
const STAR_CENTER = { x: 0.32, y: -0.28 };
const PROXIMITY_RADIUS = 0.4;

export function NameStar({
  offsetX,
  offsetY,
  cursorX,
  cursorY,
}: {
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
}) {
  const shouldReduceMotion = useReducedMotion();

  const rotation = useMotionValue(0);
  const targetSpeed = useTransform([cursorX, cursorY], (latest) => {
    const [x, y] = latest as [number, number];
    const dx = x - STAR_CENTER.x;
    const dy = y - STAR_CENTER.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const proximity = Math.max(0, 1 - distance / PROXIMITY_RADIUS);
    return (
      BASE_DEGREES_PER_SECOND +
      proximity * (MAX_DEGREES_PER_SECOND - BASE_DEGREES_PER_SECOND)
    );
  });
  const speed = useSpring(targetSpeed, { stiffness: 40, damping: 15 });

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion) return;
    rotation.set(rotation.get() + (speed.get() * delta) / 1000);
  });

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 600 600"
      preserveAspectRatio="xMidYMid slice"
      style={{ x: offsetX, y: offsetY }}
      className="pointer-events-none absolute -top-10 right-0 -z-10 h-[26rem] w-[26rem] text-accent sm:-top-4 sm:h-[30rem] sm:w-[30rem]"
    >
      <motion.g style={{ rotate: rotation, transformOrigin: "300px 300px" }}>
        <path
          d={starPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeOpacity={0.4}
          strokeLinejoin="round"
          strokeDasharray="14 10"
          className="motion-safe:animate-flow-line"
          style={{ animationDuration: "22s" }}
        />
      </motion.g>
      {sparkles.map((s) => (
        <path
          key={`${s.cx}-${s.cy}`}
          d={sparklePath(s.cx, s.cy, s.r)}
          fill="currentColor"
          className="motion-safe:animate-twinkle"
          style={{ animationDuration: s.duration, animationDelay: s.delay }}
        />
      ))}
    </motion.svg>
  );
}
