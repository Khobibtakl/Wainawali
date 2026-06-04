/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Calendar, FileAudio, RotateCcw, Award, Sparkles, Check, ChevronDown } from "lucide-react";
import { saveAudioBlob, getAudioBlob, deleteAudioBlob } from "../utils/db";
import { VoiceRecording, SpeechTopic, ThemeConfig } from "../types";
import { CHALLENGE_TOPICS } from "../data/tips";

interface VoiceRecorderProps {
  theme: ThemeConfig;
  recordings: VoiceRecording[];
  onAddRecording: (recording: VoiceRecording) => void;
  onDeleteRecording: (id: string) => void;
  xpPoints: number;
  onAddXp: (amount: number) => void;
}

export default function VoiceRecorder({
  theme,
  recordings,
  onAddRecording,
  onDeleteRecording,
  xpPoints,
  onAddXp,
}: VoiceRecorderProps) {
  // Speech Practice variables
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<SpeechTopic | null>(null);
  const [activeChallengeMode, setActiveChallengeMode] = useState<"free" | "1min" | "3min" | "5min">("free");
  const [challengeTargetSec, setChallengeTargetSec] = useState(0);

  // Audio Playback states
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // UI state
  const [recordingTitle, setRecordingTitle] = useState("");
  const [savedSuccessMessage, setSavedSuccessMessage] = useState("");
  const [micError, setMicError] = useState("");

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const activeAudioPlayersRef = useRef<Record<string, HTMLAudioElement>>({});

  // Reset timers on unmount
  useEffect(() => {
    return () => {
      stopAllTimersAndStreams();
      // Stop any playing audio
      const players = activeAudioPlayersRef.current;
      Object.keys(players).forEach((key) => {
        players[key].pause();
      });
    };
  }, []);

  const stopAllTimersAndStreams = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  };

  // Live wave visualizer using requestAnimationFrame
  const startCanvasVisualization = (stream: MediaStream | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let analyser: AnalyserNode | null = null;
    let dataArray = new Uint8Array(0);

    // If stream is active, use Web Audio API
    if (stream) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const anal = audioCtx.createAnalyser();
        anal.fftSize = 256;
        source.connect(anal);
        analyser = anal;
        analyserRef.current = anal;
        dataArray = new Uint8Array(anal.frequencyBinCount);
      } catch (err) {
        console.warn("Could not start real audio context (restricted environment). Falling back to mock wave.", err);
      }
    }

    let angle = 0;
    const draw = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser) {
        // Draw real mic frequency wave
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (width / dataArray.length) * 1.5;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.9 + 4;
          const r = 16 + (i * 2);
          const g = 185;
          const b = 129;

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          // Mirror bars from bottom and top to make it look like a nice voice bar
          ctx.fillRect(x, height / 2 - barHeight / 2, barWidth - 2, barHeight);
          x += barWidth;
        }
      } else {
        // Mock sinusoidal pulse for restricted environment / fallback
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.85)"; // emerald color

        for (let i = 0; i < width; i++) {
          const amplitude = isRecording ? (Math.sin(angle + i * 0.05) * Math.sin(angle * 0.2) * 20 + 8) : 4;
          const y = height / 2 + Math.sin(angle + i * 0.08) * amplitude;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();

        angle += isRecording ? 0.08 : 0.02;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const handleStartRecording = async () => {
    setMicError("");
    setSavedSuccessMessage("");
    setRecordingSeconds(0);

    try {
      // Standard getUserMedia check
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const id = "rec_" + Date.now();
        const dateStr = new Date().toISOString();

        // Save audio to IndexedDB
        await saveAudioBlob(id, audioBlob, dateStr);

        // Truncate seconds or use what was counted
        const finalSec = recordingSeconds;

        let title = recordingTitle.trim();
        if (!title) {
          title = selectedTopic
            ? `تمرين: ${selectedTopic.topic}`
            : `ځانګړی تمرين د غږ #${recordings.length + 1}`;
        }

        const newRecording: VoiceRecording = {
          id,
          title,
          duration: finalSec || 5,
          recordedAt: dateStr,
          topicId: selectedTopic?.id,
        };

        onAddRecording(newRecording);

        // Reward XP points for speaking!
        let xpReward = 15;
        if (activeChallengeMode !== "free") xpReward = 45; // Challenge bonus
        onAddXp(xpReward);

        setSavedSuccessMessage(`ستاسو وينا د «${title}» تر عنوان لاندې په برياليتوب سره د تمرينونو تاريخ کې خوندي شوه! د ${xpReward} XP نمرې مو وګټلې.`);
        setRecordingTitle("");
        setIsRecording(false);
      };

      // Start Recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start visualization with actual stream
      startCanvasVisualization(stream);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          // If in challenge mode, check limit
          if (activeChallengeMode !== "free" && prev >= challengeTargetSec) {
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.warn("Microphone not found or permission blocked. Starting visual speech studio simulations", err);
      // Give fallback interactive simulation for iframe environment!
      setIsRecording(true);
      startCanvasVisualization(null); // Simulated wave
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (activeChallengeMode !== "free" && prev >= challengeTargetSec) {
            handleSimulatedStop();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      stopAllTimersAndStreams();
    } else {
      // Falling back to simulated stop
      handleSimulatedStop();
    }
  };

  const handleSimulatedStop = () => {
    stopAllTimersAndStreams();
    setIsRecording(false);

    const id = "rec_" + Date.now();
    const dateStr = new Date().toISOString();

    let title = recordingTitle.trim();
    if (!title) {
      title = selectedTopic
        ? `تمرين: ${selectedTopic.topic}`
        : `ځانګړی تمرين د غږ #${recordings.length + 1}`;
    }

    const newRecording: VoiceRecording = {
      id,
      title,
      duration: recordingSeconds || 45,
      recordedAt: dateStr,
      topicId: selectedTopic?.id,
    };

    onAddRecording(newRecording);

    let xpReward = 20;
    if (activeChallengeMode !== "free") xpReward = 50; 
    onAddXp(xpReward);

    setSavedSuccessMessage(`تمرين خوندي شو (په اېفرېم کې سمولیشن)! د «${title}» تر مېلان لاندې د تاریخ په برخه کې عیار شو او تاسو ته ${xpReward} XP ورکړل شول.`);
    setRecordingTitle("");
    setRecordingSeconds(0);
  };

  const handlePlayRecording = async (rec: VoiceRecording) => {
    if (currentPlayingId === rec.id) {
      // Pause
      const player = activeAudioPlayersRef.current[rec.id];
      if (player) {
        player.pause();
        setCurrentPlayingId(null);
      }
      return;
    }

    // Stop currently playing
    if (currentPlayingId && activeAudioPlayersRef.current[currentPlayingId]) {
      activeAudioPlayersRef.current[currentPlayingId].pause();
    }

    try {
      const blob = await getAudioBlob(rec.id);
      if (!blob) {
        // Fallback for simulation recordings that don't have blobs
        console.warn("Audio file contains simulated content in iframe context");
        setCurrentPlayingId(rec.id);
        setPlaybackDuration(rec.duration);
        setPlaybackTime(0);

        const simulTimer = setInterval(() => {
          setPlaybackTime((prev) => {
            if (prev >= rec.duration) {
              clearInterval(simulTimer);
              setCurrentPlayingId(null);
              return 0;
            }
            return prev + 1;
          });
        }, 1000);

        return;
      }

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudioPlayersRef.current[rec.id] = audio;

      setCurrentPlayingId(rec.id);
      setPlaybackDuration(rec.duration);
      setPlaybackTime(0);

      audio.onplay = () => {
        // periodic timer
      };

      audio.ontimeupdate = () => {
        setPlaybackTime(Math.floor(audio.currentTime));
      };

      audio.onended = () => {
        setCurrentPlayingId(null);
        setPlaybackTime(0);
      };

      audio.play();
    } catch (err) {
      console.error("Playback error", err);
    }
  };

  const startChallenge = (mode: "1min" | "3min" | "5min") => {
    setActiveChallengeMode(mode);
    setMicError("");
    setSavedSuccessMessage("");

    let targetSeconds = 60;
    if (mode === "3min") targetSeconds = 180;
    if (mode === "5min") targetSeconds = 300;

    setChallengeTargetSec(targetSeconds);

    // Pick random topic if none selected
    if (!selectedTopic) {
      pickRandomTopic();
    }
  };

  const pickRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * CHALLENGE_TOPICS.length);
    setSelectedTopic(CHALLENGE_TOPICS[randomIndex]);
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
  };

  const activeChallengeText = () => {
    if (activeChallengeMode === "1min") return "د ۱ دقيقې سټېج ننګونه";
    if (activeChallengeMode === "3min") return "د ۳ دقيقو سټېج ننګونه";
    if (activeChallengeMode === "5min") return "د ۵ دقيقو عالي بيان";
    return "بې له وخته آزاد تمرين";
  };

  return (
    <div className="space-y-6">
      {/* Title Header with status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Mic className="text-emerald-500 w-7 h-7" />
            د وينا والي علمي تمرینات او ننګونې
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            خپل غږ ثبت کړئ، د تمرینونو بېلابېل کجونه وکاروئ او خپل د مفاهمې مهارتونه لوړ کړئ.
          </p>
        </div>

        {/* Rapid Topic generator */}
        <button
          onClick={pickRandomTopic}
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-xs font-bold rounded-xl text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>موضوع بدله کړئ (تصادفي موضوع)</span>
        </button>
      </div>

      {/* Selected Topic Visual Glassmorphism Board */}
      <div className="bg-gradient-to-br from-emerald-600/10 to-teal-500/5 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute right-4 top-4 bg-emerald-500/20 dark:bg-emerald-500/45 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 dark:text-emerald-100 flex items-center gap-1">
          <Award className="w-3 h-3" />
          <span>د خبرو لپاره د نن ورځې وړاندیز شوې موضوع</span>
        </div>

        <div className="mt-4 space-y-3">
          <h3 className="text-lg md:text-xl font-extrabold text-zinc-900 dark:text-white leading-relaxed">
            {selectedTopic ? selectedTopic.topic : "زما د ژوند تر ټولو غښتلې انګېزه او مخکښ هدف"}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-650 dark:text-zinc-350">
              ډلبندي: <strong>{selectedTopic ? selectedTopic.category : "ژوند"}</strong>
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold ${
              selectedTopic?.difficulty === "سخت"
                ? "bg-red-500/10 text-red-650 dark:text-red-400"
                : selectedTopic?.difficulty === "متوسط"
                ? "bg-amber-500/10 text-amber-650 dark:text-amber-450"
                : "bg-emerald-500/10 text-emerald-650 dark:text-emerald-400"
            }`}>
              کچه: {selectedTopic ? selectedTopic.difficulty : "صادق"}
            </span>
          </div>
        </div>
      </div>

      {/* Active Studio Recorder Canvas Board */}
      <div className={`p-6 rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow-xl relative overflow-hidden`}>
        {/* Glow corner */}
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-mono uppercase bg-zinc-100 dark:bg-zinc-805/80 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 tracking-wider">
            {activeChallengeText()}
          </span>

          {/* Time and Limits indicators */}
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-mono font-extrabold text-zinc-900 dark:text-white tabular-nums tracking-wide">
              {formatTime(recordingSeconds)}
            </span>
            {activeChallengeMode !== "free" && (
              <div className="text-xs text-zinc-500">
                هدف: {formatTime(challengeTargetSec)} زېرمه
              </div>
            )}
          </div>

          {/* Canvas Wave Visualizer */}
          <div className="w-full h-24 bg-zinc-100/50 dark:bg-zinc-950/40 rounded-xl relative overflow-hidden border border-zinc-200/50 dark:border-zinc-850">
            <canvas ref={canvasRef} width={500} height={96} className="w-full h-full block" />
            {!isRecording && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-400 dark:text-zinc-500 select-none">
                د تمرين د پیل لپاره پر لاندې مېک ووهئ
              </span>
            )}
          </div>

          {/* Title input field during stop state */}
          {!isRecording && (
            <div className="w-full max-w-sm">
              <input
                type="text"
                placeholder="د تمرین لپاره ځانګړی سرلیک (اختیاري)..."
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/50 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Micro buttons panel */}
          <div className="flex justify-center items-center gap-4">
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg hover:shadow-red-500/20 hover:scale-105 transition duration-300"
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition duration-300 border-2 border-emerald-400/40"
              >
                <Mic className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Choose Time limits tabs if not recording */}
          {!isRecording && (
            <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/40 w-full">
              <button
                onClick={() => setActiveChallengeMode("free")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeChallengeMode === "free"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                    : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 hover:text-zinc-700"
                }`}
              >
                آزاد ثبت
              </button>
              <button
                onClick={() => startChallenge("1min")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeChallengeMode === "1min"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                    : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 hover:text-zinc-700"
                }`}
              >
                ۱ دقيقه ننګونه
              </button>
              <button
                onClick={() => startChallenge("3min")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeChallengeMode === "3min"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                    : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 hover:text-zinc-700"
                }`}
              >
                ۳ دقيقې ننګونه
              </button>
              <button
                onClick={() => startChallenge("5min")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeChallengeMode === "5min"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                    : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 hover:text-zinc-700"
                }`}
              >
                ۵ دقيقې ننګونه
              </button>
            </div>
          )}
        </div>

        {/* Display response messages */}
        {savedSuccessMessage && (
          <div className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-100 rounded-xl text-xs flex items-start gap-2 animate-pulse">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}

        {micError && (
          <div className="mt-4 p-3 bg-red-500/15 border border-red-500/20 text-red-800 dark:text-red-200 rounded-xl text-xs">
            {micError}
          </div>
        )}
      </div>

      {/* History of recordings section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <FileAudio className="w-4.5 h-4.5 text-emerald-500" />
          زما د ويناوالې هڅې او تاريخچه ({recordings.length})
        </h3>

        {recordings.length === 0 ? (
          <div className="p-10 border border-dashed border-zinc-250 dark:border-zinc-800 text-center rounded-2xl">
            <FileAudio className="w-12 h-12 text-zinc-350 dark:text-zinc-700 mx-auto mb-3" />
            <h4 className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">هیڅ د کلام تمرين لا ثبت شوی نه دی</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">د ځان لپاره موضوع وټاکئ او خپل غږ ثبتول پيل کړئ.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recordings.map((rec) => {
              const isPlaying = currentPlayingId === rec.id;
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md flex items-center justify-between gap-3 relative overflow-hidden"
                >
                  {/* Progress Line on top if playing */}
                  {isPlaying && (
                    <div
                      className="absolute top-0 right-0 h-1 bg-emerald-500"
                      style={{ width: `${(playbackTime / playbackDuration) * 100}%` }}
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayRecording(rec)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${
                        isPlaying
                          ? "bg-emerald-500 text-white border-emerald-400"
                          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 shrink-0 mr-0.5" />}
                    </button>

                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-zinc-850 dark:text-zinc-100 line-clamp-1">{rec.title}</span>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                        <span className="flex items-center gap-0.5 font-mono">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {new Date(rec.recordedAt).toLocaleDateString("fa-AF", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>&bull;</span>
                        <span className="font-mono">{formatTime(rec.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete actions */}
                  <button
                    onClick={() => {
                      if (confirm("آيا واقعاً غواړئ دا تمرين حذف کړئ؟")) {
                        onDeleteRecording(rec.id);
                        deleteAudioBlob(rec.id);
                      }
                    }}
                    className="p-2 text-zinc-400 hover:text-red-500 transition rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
