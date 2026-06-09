"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { FEED_ROWS, LANGUAGE_LABELS, LANGUAGE_FLAGS, type FeedRow } from "@/lib/mock-data";

type Cell = { kind: "clip"; row: FeedRow } | { kind: "remix"; row: FeedRow; remixIdx: number };

function getCell(rowIdx: number, colIdx: number): Cell {
  const row = FEED_ROWS[rowIdx];
  return colIdx === 0 ? { kind: "clip", row } : { kind: "remix", row, remixIdx: colIdx - 1 };
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function Feed2D() {
  const [rowIdx, setRowIdx] = useState(0);
  const [colIdx, setColIdx] = useState(0);
  const [entering, setEntering] = useState(false);
  const prevKey = useRef("");
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const totalRows = FEED_ROWS.length;
  const totalCols = useCallback((r: number) => 1 + FEED_ROWS[r].remixes.length, []);

  const navigate = useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      setEntering(true);
      setTimeout(() => setEntering(false), 420);
      if (dir === "up" && rowIdx > 0) { setRowIdx(rowIdx - 1); setColIdx(0); }
      else if (dir === "down" && rowIdx < totalRows - 1) { setRowIdx(rowIdx + 1); setColIdx(0); }
      else if (dir === "left" && colIdx > 0) setColIdx(colIdx - 1);
      else if (dir === "right" && colIdx < totalCols(rowIdx) - 1) setColIdx(colIdx + 1);
    },
    [rowIdx, colIdx, totalRows, totalCols],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      };
      if (map[e.key]) { e.preventDefault(); navigate(map[e.key]); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const cell = getCell(rowIdx, colIdx);
  const clip = cell.row.clip;
  const remix = cell.kind === "remix" ? cell.row.remixes[cell.remixIdx] : null;
  const thumbUrl = remix?.thumbnailUrl ?? clip.thumbnailUrl;
  const language = remix?.language ?? clip.language;
  const mode = remix?.mode ?? null;
  const creator = remix?.creator ?? clip.owner;
  const isOriginal = colIdx === 0;

  const canUp = rowIdx > 0;
  const canDown = rowIdx < totalRows - 1;
  const canLeft = colIdx > 0;
  const canRight = colIdx < totalCols(rowIdx) - 1;

  const cellKey = `${rowIdx}-${colIdx}`;

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy < -40) navigate("down");
      else if (dy > 40) navigate("up");
    } else {
      if (dx < -40) navigate("right");
      else if (dx > 40) navigate("left");
    }
  }

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ height: "100dvh" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 transition-all duration-700 ease-out" key={`bg-${rowIdx}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbUrl}
          alt=""
          className="w-full h-full object-cover scale-110"
          style={{ filter: "blur(28px) saturate(120%)", transition: "filter 0.7s ease" }}
        />
        {/* Cinematic vignette — dark at bottom for text, subtle at top for atmosphere */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 100% 70% at 50% 40%, rgba(7,7,13,0.0) 0%, rgba(7,7,13,0.65) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,7,13,0.97) 0%, rgba(7,7,13,0.55) 38%, rgba(7,7,13,0.1) 65%, rgba(7,7,13,0.25) 100%)" }} />
      </div>

      {/* ── Main content card ── */}
      <div
        key={cellKey}
        className="absolute inset-0 flex items-end justify-center"
        style={{
          paddingBottom: "6rem",
          paddingLeft: "1rem",
          paddingRight: "3.5rem",
          animation: "fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div className="w-full max-w-sm">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            {isOriginal ? (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold font-sans"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
              >
                Original
              </span>
            ) : (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-white font-sans"
                style={{
                  background: mode === "dub"
                    ? "linear-gradient(135deg, #9333ea, #ec4899)"
                    : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: mode === "dub" ? "0 0 16px #9333ea55" : "0 0 16px #7c3aed55",
                }}
              >
                {mode === "dub" ? "🎙 Dub" : "🎬 Reaction"}
              </span>
            )}
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold font-sans"
              style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)", backdropFilter: "blur(8px)" }}
            >
              {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language] ?? language}
            </span>
          </div>

          {/* Title */}
          <h2
            className="font-display font-bold text-white mb-2 leading-tight"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
          >
            {clip.title}
          </h2>

          {isOriginal && (
            <p className="text-sm font-sans mb-4 line-clamp-2" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              {clip.description}
            </p>
          )}

          {/* Creator */}
          <div className="flex items-center gap-3 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-8 h-8 rounded-full"
              style={{ border: "1.5px solid rgba(255,255,255,0.2)" }}
            />
            <div>
              <p className="text-sm font-semibold font-sans text-white leading-none mb-0.5">{creator.name}</p>
              <p className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.45)" }}>
                {creator.languages.map((l) => LANGUAGE_FLAGS[l]).join(" ")} · {creator.followers.toLocaleString()} followers
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 mb-5">
            <button
              className="flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold font-sans text-white transition-all"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", minHeight: 44 }}
            >
              <PlayIcon /> Play
            </button>
            <Link
              href={`/studio/${clip.id}`}
              className="btn-accent flex items-center gap-2 px-5 py-3 text-sm font-sans flex-1 justify-center"
              style={{ minHeight: 44 }}
            >
              🎙 Dub this
            </Link>
          </div>

          {/* Remix language strip */}
          {cell.row.remixes.length > 0 && (
            <div>
              <p className="text-xs font-sans mb-2" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Also dubbed in
              </p>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setColIdx(0)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-sans transition-all"
                  style={{
                    background: colIdx === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.08)",
                    color: colIdx === 0 ? "#07070d" : "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {LANGUAGE_FLAGS[clip.language]} {LANGUAGE_LABELS[clip.language]}
                </button>
                {cell.row.remixes.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => setColIdx(i + 1)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-sans transition-all"
                    style={{
                      background: colIdx === i + 1
                        ? "linear-gradient(135deg, #9333ea, #ec4899)"
                        : "rgba(255,255,255,0.08)",
                      color: colIdx === i + 1 ? "white" : "rgba(255,255,255,0.7)",
                      border: colIdx === i + 1 ? "1px solid transparent" : "1px solid rgba(255,255,255,0.12)",
                      boxShadow: colIdx === i + 1 ? "0 0 12px #9333ea44" : "none",
                    }}
                  >
                    {LANGUAGE_FLAGS[r.language]} {LANGUAGE_LABELS[r.language]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right-side vertical nav ── */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 items-center">
        <NavArrow dir="up" enabled={canUp} onClick={() => navigate("up")} label="↑" />

        {/* Clip position dots — each wrapped for 44px touch target */}
        <div className="flex flex-col items-center gap-0.5 py-1">
          {FEED_ROWS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setRowIdx(i); setColIdx(0); }}
              className="flex items-center justify-center transition-all duration-300"
              style={{ width: 28, height: 20 }}
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: 5,
                  height: i === rowIdx ? 18 : 5,
                  background: i === rowIdx ? "linear-gradient(180deg, #9333ea, #ec4899)" : "rgba(255,255,255,0.25)",
                  boxShadow: i === rowIdx ? "0 0 8px #9333ea66" : "none",
                }}
              />
            </button>
          ))}
        </div>

        <NavArrow dir="down" enabled={canDown} onClick={() => navigate("down")} label="↓" />
      </div>

      {/* ── Horizontal arrows (remix lanes) ── */}
      {canLeft && (
        <button
          onClick={() => navigate("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center text-sm font-bold transition-all"
          style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}
        >
          ←
        </button>
      )}
      {canRight && (
        <button
          onClick={() => navigate("right")}
          className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center text-sm font-bold transition-all"
          style={{ right: "2.5rem", width: 44, height: 44, borderRadius: "50%", background: "rgba(147,51,234,0.2)", border: "1px solid rgba(147,51,234,0.4)", color: "white", backdropFilter: "blur(8px)", boxShadow: "0 0 16px #9333ea33" }}
        >
          →
        </button>
      )}

      {/* ── Bottom hint ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5">
        {/* Remix col dots */}
        {cell.row.remixes.length > 0 && (
          <div className="flex gap-1.5">
            {Array.from({ length: totalCols(rowIdx) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setColIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === colIdx ? 20 : 6,
                  height: 6,
                  background: i === colIdx
                    ? "linear-gradient(90deg, #9333ea, #ec4899)"
                    : "rgba(255,255,255,0.2)",
                  boxShadow: i === colIdx ? "0 0 8px #9333ea55" : "none",
                }}
              />
            ))}
          </div>
        )}
        <p className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
          ↑↓ clips · ←→ languages
        </p>
      </div>

      {/* Salience badge */}
      <div
        className="absolute top-20 right-4 z-20 px-2.5 py-1 rounded-lg text-xs font-mono font-sans"
        style={{ background: "rgba(7,7,13,0.6)", color: "rgba(147,51,234,0.7)", border: "1px solid rgba(147,51,234,0.2)", backdropFilter: "blur(8px)" }}
      >
        ⚡ {clip.salienceScore.toFixed(2)}
      </div>
    </div>
  );
}

function NavArrow({ dir, enabled, onClick, label }: { dir: string; enabled: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className="flex items-center justify-center text-sm font-bold transition-all duration-200"
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: enabled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${enabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}`,
        color: enabled ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        cursor: enabled ? "pointer" : "default",
      }}
    >
      {label}
    </button>
  );
}
