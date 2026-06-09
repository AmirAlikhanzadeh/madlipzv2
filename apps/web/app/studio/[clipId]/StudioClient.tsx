"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, type Clip } from "@/lib/mock-data";

type Stage = "setup" | "countdown" | "recording" | "review" | "rendering" | "done";

const LANGUAGES = Object.entries(LANGUAGE_LABELS).map(([code, label]) => ({ code, label }));

export default function StudioClient({ clip }: { clip: Clip }) {
  const [mode, setMode] = useState<"dub" | "reaction">("dub");
  const [language, setLanguage] = useState("en");
  const [stage, setStage] = useState<Stage>("setup");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(48).fill(3));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (stage !== "recording") { setBars(Array(48).fill(3)); return; }
    const id = setInterval(() => {
      setBars((prev) => [...prev.slice(1), Math.random() * 44 + 4]);
      setElapsed((e) => +(e + 0.1).toFixed(1));
    }, 100);
    return () => clearInterval(id);
  }, [stage]);

  function startCountdown() {
    setStage("countdown");
    let c = 3;
    setCountdown(c);
    timerRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c === 0) { clearInterval(timerRef.current!); setElapsed(0); setStage("recording"); }
    }, 1000);
  }

  function reset() { setStage("setup"); setElapsed(0); }

  return (
    <div className="flex flex-col min-h-screen" style={{ paddingTop: 56 }}>
      <div className="flex flex-1 min-h-0">
        {/* ── Left: clip preview ── */}
        <div className="relative hidden md:block w-1/2 flex-shrink-0 overflow-hidden" style={{ background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={clip.thumbnailUrl} alt={clip.title} className="w-full h-full object-cover" style={{ opacity: 0.6 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, #07070d), linear-gradient(to top, #07070d 0%, transparent 30%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-sans mb-4 transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
              ← Feed
            </Link>
            <p className="text-xs font-sans uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>{clip.category}</p>
            <h2 className="font-display font-bold text-2xl text-white leading-snug mb-2">{clip.title}</h2>
            <p className="text-sm font-sans leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{clip.description}</p>
          </div>
          {/* Fake progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--border)" }}>
            <div className="h-full w-1/3" style={{ background: "linear-gradient(90deg, #9333ea, #ec4899)" }} />
          </div>
        </div>

        {/* ── Right: studio ── */}
        <div
          className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto"
          style={{ borderLeft: "1px solid var(--border)" }}
        >
          {stage === "setup" && (
            <div className="animate-fade-up">
              <p className="text-xs font-sans uppercase tracking-widest mb-1" style={{ color: "var(--accent)", letterSpacing: "0.15em" }}>Studio</p>
              <h1 className="font-display font-bold text-3xl text-ink mb-1">Dub this clip</h1>
              <p className="text-sm font-sans mb-8" style={{ color: "var(--muted)" }}>Your voice, your language, their content.</p>

              <div className="mb-7">
                <label className="text-xs font-sans uppercase tracking-widest mb-3 block" style={{ color: "var(--muted)" }}>Mode</label>
                <div className="flex gap-2">
                  {(["dub", "reaction"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className="flex-1 py-3.5 rounded-2xl text-sm font-semibold font-sans transition-all capitalize"
                      style={{
                        background: mode === m ? "linear-gradient(135deg, #9333ea, #ec4899)" : "var(--surface)",
                        color: mode === m ? "white" : "var(--muted)",
                        border: `1px solid ${mode === m ? "transparent" : "var(--border)"}`,
                        boxShadow: mode === m ? "0 0 24px #9333ea44" : "none",
                      }}
                    >
                      {m === "dub" ? "🎙 Dub" : "🎬 Reaction"}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-sans mt-2.5" style={{ color: "var(--muted)" }}>
                  {mode === "dub" ? "Replace original audio with your voice in your language." : "Record your reaction alongside the clip."}
                </p>
              </div>

              <div className="mb-9">
                <label className="text-xs font-sans uppercase tracking-widest mb-3 block" style={{ color: "var(--muted)" }}>Your language</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 pb-1">
                  {LANGUAGES.slice(0, 12).map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => setLanguage(code)}
                      className="py-2.5 px-2 rounded-xl text-xs font-medium font-sans text-center transition-all"
                      style={{
                        background: language === code ? "rgba(147,51,234,0.2)" : "var(--surface)",
                        color: language === code ? "#c084fc" : "var(--muted)",
                        border: `1px solid ${language === code ? "rgba(147,51,234,0.5)" : "var(--border)"}`,
                        boxShadow: language === code ? "0 0 12px rgba(147,51,234,0.2)" : "none",
                      }}
                    >
                      {LANGUAGE_FLAGS[code]} {label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startCountdown} className="btn-accent w-full py-4 rounded-2xl font-display font-bold text-lg mt-auto">
                Start recording
              </button>
            </div>
          )}

          {stage === "countdown" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-5">
              <p className="text-xs font-sans uppercase tracking-widest" style={{ color: "var(--muted)" }}>Get ready</p>
              <div
                className="w-36 h-36 rounded-full flex items-center justify-center font-display font-black text-7xl text-white animate-glow-pulse"
                style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", boxShadow: "0 0 60px #9333ea77, 0 0 100px #ec489933" }}
              >
                {countdown}
              </div>
              <p className="text-sm font-sans" style={{ color: "var(--muted)" }}>
                {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]} · {mode}
              </p>
            </div>
          )}

          {stage === "recording" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-8">
              {/* Waveform */}
              <div
                className="w-full rounded-2xl flex items-end justify-center gap-px px-5 overflow-hidden"
                style={{ height: 88, background: "var(--surface)", border: "1px solid var(--border-2)" }}
              >
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-full flex-1 transition-all"
                    style={{
                      minWidth: 3,
                      height: Math.min(h, 72),
                      marginBottom: 8,
                      background: `hsl(${270 + (h / 48) * 60}, 90%, 65%)`,
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="font-display font-bold text-5xl text-ink tabular-nums">{elapsed.toFixed(1)}s</p>
                <p className="text-sm font-sans mt-1.5" style={{ color: "var(--muted)" }}>
                  {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]} {mode}
                </p>
              </div>

              <button
                onClick={() => setStage("review")}
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  border: "4px solid rgba(220,38,38,0.25)",
                  boxShadow: "0 0 32px rgba(220,38,38,0.5)",
                  animation: "glowPulse 1.5s ease-in-out infinite",
                }}
              >
                ■
              </button>
            </div>
          )}

          {stage === "review" && (
            <div className="flex flex-col flex-1 gap-6 animate-fade-up">
              <div>
                <h2 className="font-display font-bold text-2xl text-ink mb-1">Review</h2>
                <p className="text-sm font-sans" style={{ color: "var(--muted)" }}>
                  {elapsed.toFixed(1)}s · {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]} · {mode}
                </p>
              </div>

              <div
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <button
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", boxShadow: "0 0 16px #9333ea55" }}
                >
                  ▶
                </button>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "var(--border-2)" }}>
                    <div className="h-full w-2/5 rounded-full" style={{ background: "linear-gradient(90deg, #9333ea, #ec4899)" }} />
                  </div>
                  <p className="text-xs font-sans" style={{ color: "var(--muted)" }}>Your recording · {elapsed.toFixed(1)}s</p>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button
                  onClick={() => { setStage("rendering"); setTimeout(() => setStage("done"), 2200); }}
                  className="btn-accent w-full py-4 rounded-2xl font-display font-bold text-lg"
                >
                  Submit {mode}
                </button>
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-2xl font-semibold font-sans text-sm"
                  style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  Re-record
                </button>
              </div>
            </div>
          )}

          {stage === "rendering" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-5">
              <div
                className="w-16 h-16 rounded-full border-4 animate-spin"
                style={{ borderColor: "rgba(147,51,234,0.25)", borderTopColor: "#9333ea" }}
              />
              <div className="text-center">
                <p className="font-display font-semibold text-lg text-ink mb-1">Rendering…</p>
                <p className="text-sm font-sans" style={{ color: "var(--muted)" }}>Syncing · Labelling · Adding to feed</p>
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center animate-scale-in">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                style={{ background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.4)", boxShadow: "0 0 32px rgba(16,185,129,0.2)" }}
              >
                ✓
              </div>
              <div>
                <h2 className="font-display font-bold text-3xl text-ink mb-2">Live!</h2>
                <p className="text-sm font-sans" style={{ color: "var(--muted)" }}>
                  Your {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]} {mode} of <span className="text-ink">&ldquo;{clip.title}&rdquo;</span> is now on the feed.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/" className="btn-accent px-6 py-2.5 font-sans text-sm">Back to feed</Link>
                <button onClick={reset} className="px-6 py-2.5 rounded-full font-sans text-sm" style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  Dub another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
