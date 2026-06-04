/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { Award, Zap, BookOpen, Clock, BadgeAlert, Trophy, ShieldCheck, Download, Star, Sparkles } from "lucide-react";
import { UserState, ThemeConfig } from "../types";
import { LESSONS } from "../data/lessons";

interface DashboardTabProps {
  theme: ThemeConfig;
  userState: UserState;
  onAddXp: (amount: number) => void;
}

export default function DashboardTab({ theme, userState, onAddXp }: DashboardTabProps) {
  const certificateRef = useRef<SVGSVGElement | null>(null);

  // Statistics
  const lessonsCompletedCount = userState.completedLessons.length;
  const totalLessons = LESSONS.length;
  const percentLessonsDone = Math.round((lessonsCompletedCount / totalLessons) * 100) || 0;

  const quizCount = Object.keys(userState.completedQuizzes).length;
  const recordingsDone = userState.recordingsCount || 0;
  const totalSecs = userState.totalSpeakingTime || 0;

  const formatSpeakingTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min} دقيقې او ${sec} ثانيې`;
  };

  // Badges system based on achievements
  const BADGES = [
    {
      id: "b1",
      title: "د ویناوالۍ لومړنی بريدګر",
      desc: "د لومړي لوست لوستلو له امله",
      required: () => userState.completedLessons.length >= 1,
      icon: "🔥",
    },
    {
      id: "b2",
      title: "د باور مجسمه",
      desc: "د ۵ مختلفو جرئت ننګونو بشپړولو له امله",
      required: () => userState.completedCourageTasks.length >= 4,
      icon: "🛡️",
    },
    {
      id: "b3",
      title: "د غږ خاوند",
      desc: "د ۳ غږ تمرینونه په تالار کې خوندي کولو له امله",
      required: () => recordingsDone >= 3,
      icon: "📢",
    },
    {
      id: "b4",
      title: "عالي ماهر (د ټولو لوستونو اتل)",
      desc: "د ټولو لسو درسونو او کوېزونو د خلاصولو له امله",
      required: () => lessonsCompletedCount >= totalLessons,
      icon: "👑",
    },
    {
      id: "b5",
      title: "نه ماتېدونکی هوډ",
      desc: "له ۱۰۰۰ څخه زیاتو XP درجو ته د رسېدو له امله",
      required: () => userState.xp >= 1000,
      icon: "💎",
    }
  ];

  const handleDownloadCertificate = () => {
    if (!certificateRef.current) return;

    try {
      const svgData = new XMLSerializer().serializeToString(certificateRef.current);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `Venawall_Certificate_${userState.name.replace(/\s+/g, "_")}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      onAddXp(20); // Bonus for exporting/completing!
    } catch (err) {
      console.error("Certificate download error", err);
    }
  };

  const isEligibleForCertificate = lessonsCompletedCount >= totalLessons;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <Trophy className="text-emerald-500 w-7 h-7" />
          زما د پرمختګ او وړتیا سکرین
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          دلته خپل د ګيم نمرې (XP)، تر لاسه شوي تعهدات، د لوستونو كجه او د فراغت شهادتپاڼې په روښانه ډول وګورئ.
        </p>
      </div>

      {/* Level and XP visual glassmorphic dashboard */}
      <div className={`p-6 rounded-3xl border ${theme.cardLight} dark:${theme.cardDark} shadow-xl relative overflow-hidden`}>
        {/* Glow behind */}
        <div className="absolute right-10 bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-4 col-span-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex flex-col items-center justify-center font-mono font-bold shadow-lg border border-emerald-400/30">
              <span className="text-[10px] leading-tight uppercase font-sans">کچه</span>
              <span className="text-2xl leading-tight">{userState.level}</span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{userState.name} ورور/خور</span>
                <span className="font-mono text-zinc-500">{userState.xp} / {(userState.level) * 500} XP نمرې</span>
              </div>
              {/* Custom detailed Progress bar */}
              <div className="w-full h-3 bg-zinc-150 dark:bg-zinc-800 rounded-full relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${userState.levelProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 block">{userState.levelProgress}% د بلې کچې لپاره پاتې دی</span>
            </div>
          </div>

          <div className="flex items-center justify-around sm:justify-end gap-6 border-t sm:border-t-0 sm:border-r border-zinc-250 dark:border-zinc-800 pt-4 sm:pt-0 sm:pr-6">
            <div className="text-center">
              <span className="text-2xl font-mono font-extrabold text-amber-500 flex items-center gap-1 justify-center">
                <Zap className="w-5 h-5 fill-current animate-pulse" />
                {userState.streak}
              </span>
              <span className="text-[10px] text-zinc-500 block">پرله پسې مېلان</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-mono font-extrabold text-emerald-500 block">
                {userState.xp}
              </span>
              <span className="text-[10px] text-zinc-500 block">ټول نمرې (XP)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Tiles Box */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-205 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">لوستل شوي درسونه</span>
            <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">{lessonsCompletedCount} / {totalLessons}</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-205 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">ازموینې (کوېزونه)</span>
            <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">{quizCount} کوېزه</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-205 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">د خبرو تمرينات</span>
            <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">{recordingsDone} ځله</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-205 dark:border-zinc-800 flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <Star className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">د ويناوو ټول وخت</span>
            <span className="text-xs font-bold text-zinc-905 dark:text-zinc-100">{formatSpeakingTime(totalSecs)}</span>
          </div>
        </div>
      </div>

      {/* Badge shelf section (Achievements) */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-150 uppercase tracking-wider flex items-center gap-2">
          <BadgeAlert className="w-4.5 h-4.5 text-emerald-500" />
          زما تر لاسه شوي عالي نشانونه او باډجونه ({BADGES.filter((b) => b.required()).length})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = badge.required();
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center transition duration-300 relative ${
                  isUnlocked
                    ? "bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900/50 dark:to-zinc-900/20 border-emerald-500/40 text-zinc-900 dark:text-white shadow-sm"
                    : "bg-zinc-100/50 dark:bg-zinc-950/20 border-zinc-250 dark:border-zinc-850/60 opacity-40 select-none"
                }`}
              >
                <div className="text-3xl mb-2">{isUnlocked ? badge.icon : "🔒"}</div>
                <h4 className="text-xs font-bold leading-tight">{badge.title}</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Certificate Builder section */}
      <div className={`p-6 rounded-3xl border ${theme.cardLight} dark:${theme.cardDark} shadow-lg relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              د عامه ويناوې او مفاهمې سحر شهادتپاڼه
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              زموږ په روزنیز سفر کې د ټولو لسو درسونو خوندي او بشپړ لوستلو وروسته تاسو ته دا رسمي فراغت پاڼه وړاندې کېږي.
            </p>
          </div>

          {isEligibleForCertificate ? (
            <button
              onClick={handleDownloadCertificate}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:scale-105 transition"
            >
              <Download className="w-4 h-4" />
              فراغت پاڼه ډاونلوډ کړئ
            </button>
          ) : (
            <div className="text-xs p-2.5 bg-zinc-100 dark:bg-zinc-850 rounded-xl text-zinc-500 font-bold border border-zinc-200 dark:border-zinc-800">
              بيا د {lessonsCompletedCount} له {totalLessons} مضمون وروسته خلاصېږي
            </div>
          )}
        </div>

        {/* Dynamic preview certificate template - gorgeous custom SVG parchment render! */}
        <div className="w-full flex justify-center bg-zinc-100/80 dark:bg-zinc-950/50 p-4 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-850">
          <div className="w-full max-w-xl shadow-2xl rounded-lg bg-white overflow-hidden border border-amber-900/10">
            <svg
              ref={certificateRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 842 595"
              className="w-full h-auto block bg-amber-50"
              style={{ fontFamily: "'Vazirmatn', sans-serif" }}
            >
              {/* Outer classic parchment lines and border */}
              <rect x="20" y="20" width="802" height="555" fill="#fcfcf0" stroke="#f1e0c6" strokeWidth="6" rx="4" />
              <rect x="30" y="30" width="782" height="535" fill="none" stroke="#d5b882" strokeWidth="3" rx="3" />
              <rect x="36" y="36" width="770" height="523" fill="none" stroke="#d5b882" strokeWidth="1" strokeDasharray="6,4" />

              {/* Decorative Corner Ornaments */}
              <path d="M 33 50 L 50 33 L 70 33 L 33 70 Z" fill="#d5b882" />
              <path d="M 809 50 L 792 33 L 772 33 L 809 70 Z" fill="#d5b882" />
              <path d="M 33 545 L 50 562 L 70 562 L 33 525 Z" fill="#d5b882" />
              <path d="M 809 545 L 792 562 L 772 562 L 809 525 Z" fill="#d5b882" />

              {/* Header Title: ویناوال */}
              <text x="421" y="90" fill="#0f281e" fontSize="32" fontWeight="bold" textAnchor="middle">
                د عامه ويناوالۍ د کورس فراغت ليک
              </text>
              <line x1="300" y1="105" x2="542" y2="105" stroke="#d5b882" strokeWidth="2" />

              {/* Small logo element in SVG */}
              <circle cx="421" cy="150" r="28" fill="#10b981" />
              <path d="M 416 142 L 416 154 A 5 5 0 0 0 426 154 L 426 142 Z" fill="#ffffff" />
              <rect x="419" y="137" width="4" height="6" rx="1" fill="#ffffff" />

              {/* Central wording */}
              <text x="421" y="220" fill="#5c5c50" fontSize="13" textAnchor="middle">
                دا شهادتپاڼه په خورا وياړ چمتو شوې ده د:
              </text>

              {/* Candidate Name */}
              <text x="421" y="278" fill="#0b1c15" fontSize="36" fontWeight="bold" textAnchor="middle">
                {userState.name || "احمد ولي"}
              </text>
              <line x1="220" y1="298" x2="622" y2="298" stroke="#d5b882" strokeWidth="1" />

              {/* Success metrics */}
              <text x="421" y="340" fill="#444" fontSize="14" textAnchor="middle">
                د ویناوال پښتو اپليکېشن کې د ټولو {totalLessons} روزنیزو درسونو، د جرات ننګونو
              </text>
              <text x="421" y="365" fill="#444" fontSize="14" textAnchor="middle">
                او د عملي غږ ازموینو په کاميابۍ سره بشپړولو له امله.
              </text>

              {/* XP and stats tag */}
              <rect x="290" y="395" width="262" height="36" rx="18" fill="#e6f4ea" stroke="#a3cfbb" strokeWidth="1" />
              <text x="421" y="418" fill="#146c43" fontSize="12" fontWeight="bold" textAnchor="middle">
                درجه: {userState.level} کچه اتل &bull; {userState.xp} ټولې نمرې
              </text>

              {/* Signatures */}
              <text x="140" y="490" fill="#777" fontSize="11" textAnchor="middle">تارېخ:</text>
              <text x="140" y="512" fill="#222" fontSize="12" fontWeight="bold" textAnchor="middle">
                {new Date().toLocaleDateString("fa-AF", { year: "numeric", month: "long", day: "numeric" })}
              </text>
              <line x1="80" y1="498" x2="200" y2="498" stroke="#ccc" strokeWidth="1" />

              <text x="702" y="490" fill="#777" fontSize="11" textAnchor="middle">لاسلیک غړی:</text>
              <text x="702" y="515" fill="#222" fontSize="13" fontWeight="bold" fontStyle="italic" textAnchor="middle" style={{ fontFamily: "serif" }}>
                د ویناوال علمي روغتون ټیم
              </text>
              <line x1="642" y1="498" x2="762" y2="498" stroke="#ccc" strokeWidth="1" />

              {/* Ribbon watermark */}
              <g transform="translate(421, 500) scale(0.6)">
                <path d="M 0,-30 L 20,10 L -20,10 Z" fill="#fab005" />
                <rect x="-10" y="10" width="20" height="30" fill="#fa5252" />
                <rect x="-18" y="10" width="8" height="25" fill="#e03131" />
                <rect x="10" y="10" width="8" height="25" fill="#e03131" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
