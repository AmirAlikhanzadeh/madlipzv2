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
  const [waveform, setWaveform] = useState<number[]>(Array(40).fill(4));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fake waveform animation during recording
  useEffect(() => {
    if (stage !== "recording") {
      setWaveform(Array(40).fill(4));
      return;
    }
    const id = setInterval(() => {
      setWaveform((prev) => {
        const next = [...prev.slice(1), Math.random() * 40 + 4];
        return next;
      });
      setElapsed((e) => e + 0.1);
    }, 100);
    return () => clearInterval(id);
  }, [stage]);

  function startCountdown() {
    setStage("countdown");
    setCountdown(3);
    let c = 3;
    timerRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c === 0) {
        clearInterval(timerRef.current!);
        setElapsed(0);
        setStage("recording");
      }
    }, 1000);
  }

  function stopRecording() {
    setStage("review");
  }

  function submitDub() {
    setStage("rendering");
    setTimeout(() => setStage("done"), 2200);
  }

  function reset() {
    setStage("setup");
    setElapsed(0);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "56px" }}>
      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* Left — clip preview */}
        <div className="relative w-full md:w-1/2 flex-shrink-0" style={{ background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={clip.thumbnailUrl}
            alt={clip.title}
            className="w-full h-full object-cover opacity-80"
            style={{ minHeight: 320 }}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              ← Back to feed
            </Link>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{clip.category}</p>
              <h2 className="text-xl font-bold text-white mb-2">{clip.title}</h2>
              <p className="text-sm text-white/60">{clip.description}</p>
            </div>
          </div>
          {/* Fake video controls */}
          <div
            className="absolute bottom-0 left-0 right-0 px-6 py-3 flex items-center gap-3"
            style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}
          >
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
              <div className="h-full w-1/3 rounded-full" style={{ background: "var(--accent)" }} />
            </div>
            <span className="text-xs text-white/60">0:42</span>
          </div>
        </div>

        {/* Right — recording studio */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-10" style={{ borderLeft: "1px solid var(--border)" }}>

          {stage === "setup" && (
            <>
              <h1 className="text-2xl font-bold mb-1">Dub this clip</h1>
              <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
                Your voice, your language, their content.
              </p>

              {/* Mode */}
              <div className="mb-6">
                <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>Mode</label>
                <div className="flex gap-2">
                  {(["dub", "reaction"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all"
                      style={{
                        background: mode === m ? "var(--accent)" : "var(--surface)",
                        color: mode === m ? "white" : "var(--muted)",
                        border: `1px solid ${mode === m ? "var(--accent)" : "var(--border)"}`,
                      }}
                    >
                      {m === "dub" ? "🎙 Dub" : "🎬 Reaction"}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                  {mode === "dub"
                    ? "Replace the original audio with your voice in your language."
                    : "Record your face reacting alongside the clip."}
                </p>
              </div>

              {/* Language */}
              <div className="mb-8">
                <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>Your language</label>
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                  {LANGUAGES.slice(0, 12).map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => setLanguage(code)}
                      className="py-2 px-2 rounded-lg text-xs font-medium text-center transition-all"
                      style={{
                        background: language === code ? "var(--accent)" : "var(--surface)",
                        color: language === code ? "white" : "var(--muted)",
                        border: `1px solid ${language === code ? "var(--accent)" : "var(--border)"}`,
                      }}
                    >
                      {LANGUAGE_FLAGS[code]} {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startCountdown}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white mt-auto"
                style={{ background: "var(--accent)" }}
              >
                Start recording
              </button>
            </>
          )}

          {stage === "countdown" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <p className="text-white/50 text-sm uppercase tracking-widest">Get ready…</p>
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-6xl font-black text-white"
                style={{ background: "var(--accent)", boxShadow: "0 0 60px var(--accent)" }}
              >
                {countdown}
              </div>
              <p className="text-white/50 text-sm">{LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]} {mode}</p>
            </div>
          )}

          {stage === "recording" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-6">
              {/* Waveform */}
              <div
                className="w-full rounded-2xl flex items-end justify-center gap-0.5 px-4"
                style={{ height: 80, background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                {waveform.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all"
                    style={{
                      width: 4,
                      height: Math.min(h, 64),
                      background: `hsl(${340 + i * 0.5}, 90%, ${55 + i * 0.3}%)`,
                      marginBottom: 8,
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-4xl font-mono font-bold text-white">{elapsed.toFixed(1)}s</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  Recording {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]} {mode}…
                </p>
              </div>

              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold animate-pulse"
                style={{ background: "#dc2626", border: "4px solid rgba(220,38,38,0.3)" }}
              >
                ■
              </button>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Tap to stop</p>
            </div>
          )}

          {stage === "review" && (
            <div className="flex flex-col flex-1 gap-5">
              <div>
                <h2 className="text-xl font-bold mb-1">Review your {mode}</h2>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {elapsed.toFixed(1)}s · {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]}
                </p>
              </div>

              {/* Fake playback */}
              <div
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  ▶
                </button>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full mb-1" style={{ background: "var(--border)" }}>
                    <div className="h-full w-2/5 rounded-full" style={{ background: "var(--accent)" }} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>Your recording</p>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button
                  onClick={submitDub}
                  className="w-full py-4 rounded-2xl font-bold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  Submit {mode}
                </button>
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-2xl font-semibold text-sm"
                  style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  Re-record
                </button>
              </div>
            </div>
          )}

          {stage === "rendering" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <div
                className="w-16 h-16 rounded-full border-4 animate-spin"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
              />
              <p className="font-semibold text-white">Rendering your {mode}…</p>
              <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
                Syncing audio · Applying labels · Adding to feed
              </p>
            </div>
          )}

          {stage === "done" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                style={{ background: "rgba(16,185,129,0.15)", border: "2px solid #10b981" }}
              >
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Live on the feed!</h2>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Your {LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]} {mode} of &quot;{clip.title}&quot; is now live.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  Back to feed
                </Link>
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold"
                  style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                >
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
