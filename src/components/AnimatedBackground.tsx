"use client";

import { useEffect, useState } from "react";
import { useIsMounted } from "@/lib/useIsMounted";

export function AnimatedBackground() {
  const mounted = useIsMounted();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      // Subtle parallax shift between -15px and +15px
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="bg-grid-mesh absolute inset-0 opacity-60" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Subtle Dot Mesh Texture Overlay */}
      <div className="bg-grid-mesh absolute inset-0 opacity-50 dark:opacity-60" />

      {/* Interactive Floating Container with Mouse Parallax Shift */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        }}
      >
        {/* Floating Aurora Orb 1: Violet / Indigo (Top Left) */}
        <div className="animate-aurora-1 absolute -left-20 -top-20 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-violet-600/25 via-indigo-500/20 to-purple-600/10 blur-[130px] dark:from-violet-600/35 dark:via-purple-600/25 dark:to-indigo-900/20" />

        {/* Floating Aurora Orb 2: Cyan / Emerald (Top Right) */}
        <div className="animate-aurora-2 absolute -right-20 top-1/4 h-[560px] w-[560px] rounded-full bg-gradient-to-bl from-cyan-500/20 via-sky-400/15 to-emerald-500/10 blur-[140px] dark:from-cyan-400/30 dark:via-teal-500/20 dark:to-blue-900/15" />

        {/* Floating Aurora Orb 3: Pink / Magenta / Rose (Bottom Left) */}
        <div className="animate-aurora-3 absolute -bottom-32 left-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-fuchsia-500/20 via-pink-500/15 to-violet-400/10 blur-[150px] dark:from-pink-600/25 dark:via-fuchsia-600/20 dark:to-purple-900/15" />

        {/* Floating Aurora Orb 4: Amber / Gold Glow (Top Center) */}
        <div className="animate-aurora-4 absolute left-1/2 top-10 -translate-x-1/2 h-[380px] w-[380px] rounded-full bg-gradient-to-b from-amber-400/15 via-orange-400/10 to-transparent blur-[120px] dark:from-amber-400/20 dark:via-rose-500/10 dark:to-transparent" />

        {/* --- GEOMETRIC FLOATING SHAPES & STYLES --- */}

        {/* Geometric Rotating Glass Ring (Top Left) */}
        <div className="animate-spin-shape absolute left-[12%] top-[18%] h-64 w-64 rounded-full border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent backdrop-blur-3xs dark:border-violet-400/20" />

        {/* Geometric Rotating Glass Ring (Bottom Right) */}
        <div className="animate-spin-shape absolute right-[10%] bottom-[20%] h-80 w-80 rounded-[40px] border border-cyan-400/20 bg-gradient-to-tr from-cyan-500/5 to-transparent backdrop-blur-3xs dark:border-cyan-400/25" />

        {/* Floating Laser Light Beam Sweep */}
        <div className="animate-beam-sweep absolute -top-40 left-1/4 h-[800px] w-[2px] bg-gradient-to-b from-transparent via-violet-500/40 to-transparent blur-[1px] dark:via-cyan-400/50" />

        {/* --- FLOATING AMBIENT PARTICLES --- */}
        <div className="animate-particle-1 absolute left-[20%] top-[40%] h-2 w-2 rounded-full bg-violet-400/60 shadow-lg shadow-violet-500/50" />
        <div className="animate-particle-2 absolute right-[25%] top-[25%] h-2.5 w-2.5 rounded-full bg-cyan-400/60 shadow-lg shadow-cyan-400/50" />
        <div className="animate-particle-3 absolute left-[45%] bottom-[30%] h-3 w-3 rounded-full bg-pink-400/60 shadow-lg shadow-pink-400/50" />
        <div className="animate-particle-1 absolute right-[15%] bottom-[45%] h-2 w-2 rounded-full bg-amber-400/60 shadow-lg shadow-amber-400/50" />
      </div>
    </div>
  );
}
