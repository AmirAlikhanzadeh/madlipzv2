"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FEED_ROWS, LANGUAGE_LABELS, LANGUAGE_FLAGS, type FeedRow } from "@/lib/mock-data";

type Cell =
  | { kind: "clip"; row: FeedRow }
  | { kind: "remix"; row: FeedRow; remixIdx: number };

function getCell(rowIdx: number, colIdx: number): Cell {
  const row = FEED_ROWS[rowIdx];
  if (colIdx === 0) return { kind: "clip", row };
  return { kind: "remix", row, remixIdx: colIdx - 1 };
}

function CellBackground({ url }: { url: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "blur(2px)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.3) 100%)" }} />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function Feed2D() {
  const [rowIdx, setRowIdx] = useState(0);
  const [colIdx, setColIdx] = useState(0);
  const [animDir, setAnimDir] = useState<"up" | "down" | "left" | "right" | null>(null);

  const totalRows = FEED_ROWS.length;
  const totalCols = (r: number) => 1 + FEED_ROWS[r].remixes.length;

  const navigate = useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      setAnimDir(dir);
      setTimeout(() => setAnimDir(null), 280);
      if (dir === "up" && rowIdx > 0) { setRowIdx(rowIdx - 1); setColIdx(0); }
      else if (dir === "down" && rowIdx < totalRows - 1) { setRowIdx(rowIdx + 1); setColIdx(0); }
      else if (dir === "left" && colIdx > 0) setColIdx(colIdx - 1);
      else if (dir === "right" && colIdx < totalCols(rowIdx) - 1) setColIdx(colIdx + 1);
    },
    [rowIdx, colIdx, totalRows, totalCols],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp") navigate("up");
      else if (e.key === "ArrowDown") navigate("down");
      else if (e.key === "ArrowLeft") navigate("left");
      else if (e.key === "ArrowRight") navigate("right");
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

  const canUp = rowIdx > 0;
  const canDown = rowIdx < totalRows - 1;
  const canLeft = colIdx > 0;
  const canRight = colIdx < totalCols(rowIdx) - 1;

  // Slide direction for animation
  const slideStyle = {
    transition: "opacity 0.25s ease, transform 0.25s ease",
    opacity: animDir ? 0 : 1,
    transform: animDir === "up" ? "translateY(12px)" : animDir === "down" ? "translateY(-12px)" : animDir === "left" ? "translateX(12px)" : animDir === "right" ? "translateX(-12px)" : "none",
  };

  return (
    <div className="relative flex items-center justify-center overflow-hidden" style={{ height: "100dvh" }}>
      <CellBackground url={thumbUrl} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-4" style={slideStyle}>
        {/* Mode / origin badge */}
        <div className="flex items-center gap-2 mb-4">
          {colIdx === 0 ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur">
              Original
            </span>
          ) : (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: mode === "dub" ? "var(--accent)" : "#7c3aed" }}
            >
              {mode === "dub" ? "Dub" : "Reaction"}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur">
            {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language] ?? language}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white leading-snug mb-3">
          {clip.title}
        </h2>
        {colIdx === 0 && (
          <p className="text-sm text-white/70 mb-4 leading-relaxed line-clamp-2">{clip.description}</p>
        )}

        {/* Creator row */}
        <div className="flex items-center gap-3 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={creator.avatar} alt={creator.name} className="w-9 h-9 rounded-full border border-white/30" />
          <div>
            <p className="text-sm font-semibold text-white">{creator.name}</p>
            <p className="text-xs text-white/60">
              {creator.languages.map((l) => LANGUAGE_FLAGS[l]).join(" ")} · {creator.followers.toLocaleString()} followers
            </p>
          </div>
        </div>

        {/* Play button + Dub CTA */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <PlayIcon />
            Play
          </button>
          <Link
            href={`/studio/${clip.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white"
            style={{ background: "var(--accent)" }}
          >
            🎙 Dub this
          </Link>
        </div>

        {/* Remix language strip */}
        {cell.row.remixes.length > 0 && (
          <div className="mt-5">
            <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Dubs in</p>
            <div className="flex gap-2 flex-wrap">
              {cell.row.remixes.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setColIdx(i + 1)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: colIdx === i + 1 ? "white" : "rgba(255,255,255,0.15)",
                    color: colIdx === i + 1 ? "black" : "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {LANGUAGE_FLAGS[r.language]} {LANGUAGE_LABELS[r.language]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation Controls ── */}

      {/* Up/Down arrows — right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        <button
          onClick={() => navigate("up")}
          disabled={!canUp}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: canUp ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)", color: canUp ? "white" : "rgba(255,255,255,0.2)" }}
        >
          ↑
        </button>
        <button
          onClick={() => navigate("down")}
          disabled={!canDown}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: canDown ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)", color: canDown ? "white" : "rgba(255,255,255,0.2)" }}
        >
          ↓
        </button>
      </div>

      {/* Left/Right arrows — horizontal remix nav */}
      {canLeft && (
        <button
          onClick={() => navigate("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", color: "white" }}
        >
          ←
        </button>
      )}
      {canRight && (
        <button
          onClick={() => navigate("right")}
          className="absolute right-16 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", color: "white" }}
        >
          →
        </button>
      )}

      {/* ── Position indicator — bottom center ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        {/* Clip dots (vertical position) */}
        <div className="flex gap-1.5">
          {FEED_ROWS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setRowIdx(i); setColIdx(0); }}
              className="rounded-full transition-all"
              style={{
                width: i === rowIdx ? 20 : 6,
                height: 6,
                background: i === rowIdx ? "white" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
        {/* Remix dots (horizontal position) */}
        {cell.row.remixes.length > 0 && (
          <div className="flex gap-1">
            {Array.from({ length: totalCols(rowIdx) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setColIdx(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === colIdx ? "var(--accent)" : "rgba(255,255,255,0.3)", transform: i === colIdx ? "scale(1.4)" : "none" }}
              />
            ))}
          </div>
        )}
        <p className="text-xs text-white/40 mt-1">← → remix lanes · ↑ ↓ clips</p>
      </div>

      {/* Salience score badge — top right corner */}
      <div
        className="absolute top-20 right-4 z-20 px-2 py-1 rounded-lg text-xs font-mono"
        style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}
      >
        salience {clip.salienceScore.toFixed(2)}
      </div>
    </div>
  );
}
