"use client";

import { useState } from "react";
import { useAudioStore } from "@/store/audioStore";
import { motion, AnimatePresence } from "motion/react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Cercle + 3 barres verticales, animation continue en "égaliseur" (même composant que TrackList). */
function EqualizerIcon({ active }: { active: boolean }) {
  const heights = active
    ? ["5px", "13px", "7px", "11px", "5px"]
    : ["6px", "9px", "6px"];
  const duration = active ? 0.9 : 1.8;

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20">
      <span className="flex h-3 items-end gap-[3px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-[2px] rounded-full bg-white/70"
            animate={{ height: heights }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </span>
    </span>
  );
}

export function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    seek,
    duration,
    volume,
    togglePlay,
    next,
    prev,
    setSeek,
    setVolume,
    stop,
    queue,
  } = useAudioStore();
  const [isHovered, setIsHovered] = useState(false);

  const playableCount = queue.filter((t) => Boolean(t.audioUrl)).length;
  const hasPrev = playableCount > 1;
  const hasNext = playableCount > 1;

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          key="global-player"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed bottom-20 left-auto right-0 z-50 flex flex-col items-center gap-4 px-6 py-3 bg-black/80  text-white"
        >
          {/* Contrôles complets — révélés au hover de la barre */}
          <AnimatePresence initial={false}>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-1 items-center w-full gap-4 overflow-hidden mb-4"
              >
                <button
                  onClick={prev}
                  disabled={!hasPrev}
                  aria-label="Previous"
                  className="opacity-70 transition-opacity hover:opacity-100
                             disabled:opacity-20 disabled:hover:opacity-20 disabled:cursor-not-allowed"
                >
                  <PrevIcon />
                </button>

                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black
                             transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>

                <button
                  onClick={next}
                  disabled={!hasNext}
                  aria-label="Next"
                  className="opacity-70 transition-opacity hover:opacity-100
                             disabled:opacity-20 disabled:hover:opacity-20 disabled:cursor-not-allowed"
                >
                  <NextIcon />
                </button>

                {/* Seek bar */}
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.5}
                  value={seek}
                  onChange={(e) => setSeek(Number(e.target.value))}
                  className="max-w-xs flex-1 accent-white"
                  aria-label="Seek"
                />

                {/* Close */}
                {/* <button
                  onClick={stop}
                  aria-label="Stop"
                  className="text-xs opacity-50 transition-opacity hover:opacity-100"
                >
                  ✕
                </button> */}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Icône égaliseur + titre — toujours visibles */}
          <div className="flex min-w-0 items-center gap-4">
            <EqualizerIcon active={isPlaying} />
            <div className="min-h-0">
              <p className="text-sm font-medium truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-white/50">
                {formatTime(seek)} / {formatTime(duration)}
              </p>
            </div>
            {/* Volume */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 ml-6 accent-white"
              aria-label="Volume"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Micro-icons (inline SVG pour éviter une dépendance icône) ───────────────

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8l-5.5 4zM16 6h2v12h-2z" />
    </svg>
  );
}