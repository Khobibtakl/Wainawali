/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Play, Flame, Award, Shield, ArrowLeft, ArrowRight, MessageSquare, Quote, Heart, ArrowUpRight } from "lucide-react";
import { UserState, ThemeConfig } from "../types";
import { LESSONS } from "../data/lessons";
import { SPEAKING_TIPS, CONFIDENCE_TIPS, MOTIVATIONAL_QUOTES } from "../data/tips";

interface HomeTabProps {
  theme: ThemeConfig;
  userState: UserState;
  onNavigateToTab: (tabId: string) => void;
  onSetActiveLessonId: (lessonId: string | null) => void;
  onAddXp: (amount: number) => void;
}

export default function HomeTab({
  theme,
  userState,
  onNavigateToTab,
  onSetActiveLessonId,
  onAddXp,
}: HomeTabProps) {
  // Select daily content deterministically or via rotation
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [dailyLessonIdx, setDailyLessonIdx] = useState(0);
  const [speakingTipIdx, setSpeakingTipIdx] = useState(0);
  const [confidenceTipIdx, setConfidenceTipIdx] = useState(0);

  useEffect(() => {
    // Generate static indices based on current date
    const day = new Date().getDate();
    setQuoteIdx(day % MOTIVATIONAL_QUOTES.length);
    setDailyLessonIdx(day % LESSONS.length);
    setSpeakingTipIdx(day % SPEAKING_TIPS.length);
    setConfidenceTipIdx(day % CONFIDENCE_TIPS.length);
  }, []);

  const featuredQuote = MOTIVATIONAL_QUOTES[quoteIdx];
  const featuredLesson = LESSONS[dailyLessonIdx];
  const dailySpeakingTip = SPEAKING_TIPS[speakingTipIdx];
  const dailyConfidenceTip = CONFIDENCE_TIPS[confidenceTipIdx];

  // Continue reading logic: get first incomplete lesson or default
  const lastIncompleteLesson = LESSONS.find((l) => !userState.completedLessons.includes(l.id)) || LESSONS[0];

  const handleClaimDailyStreak = () => {
    onAddXp(20);
    alert("تاسو ته د ورځني مېلان ساتلو له پاره ۲۰ XP وړیا نمرې درکړل شوې! مننه چې نن هم زموږ سره یاست.");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white leading-normal">
            ښه راغلاست، {userState.name || "ګران ملګری"}! {userState.gender === "female" ? "خورې" : "وروره"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            راځئ نن یو بل نوی مهارت زده کړو او د خپل غږ انګازه قوي کړو.
          </p>
        </div>

        {/* Action item: Claim daily bonus */}
        <button
          onClick={handleClaimDailyStreak}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-450 text-white font-bold text-xs rounded-xl shadow transition self-start md:self-auto"
        >
          <Flame className="w-4 h-4 text-orange-200 fill-orange-200 animate-bounce" />
          <span>ورځنۍ وړیا نمرې واخلئ (+۲۰ XP)</span>
        </button>
      </div>

      {/* Hero Welcome continuing / Quick track */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Continue last lesson box */}
        <div className="p-5 rounded-2xl md:col-span-2 bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-850 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-xl" />

          <div className="space-y-3">
            <span className="text-[9px] bg-white/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
              زما ښوونیز سفر وغځوئ
            </span>
            <h3 className="text-lg md:text-xl font-extrabold">
              کورس دلته تعقیب کړئ: «{lastIncompleteLesson.title}»
            </h3>
            <p className="text-xs text-emerald-200 leading-relaxed max-w-md">
              دا لوست د غونډې د جلا موضوعګانو په زړه پورې فلسفې، عملي د جرات بسترونه او روزنیز کوېزونه شريکوي.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                onSetActiveLessonId(lastIncompleteLesson.id);
                onNavigateToTab("lessons");
              }}
              className="px-5 py-2 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow transition flex items-center gap-1"
            >
              <span>اوس يې لوستل پيل کړئ</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Progress circular representation box */}
        <div className={`p-5 rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow flex flex-col justify-between align-stretch`}>
          <div className="space-y-2 text-right">
            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400">زما د تعهد کجه</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-mono font-extrabold text-zinc-900 dark:text-white">
                {userState.xp}
              </span>
              <span className="text-xs text-zinc-550">درجه/XP</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-850">
            <div className="flex justify-between items-center text-[10px] text-zinc-500">
              <span>کچه: {userState.level} هود</span>
              <span>{userState.levelProgress}% بشپړ شوی</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-805 h-2 rounded-full relative overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${userState.levelProgress}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab("dashboard")}
            className="w-full py-1.5 md:py-2 text-[10px] font-bold text-zinc-650 hover:text-zinc-900 dark:text-zinc-350 dark:hover:text-white transition flex items-center justify-center gap-0.5 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg mt-3"
          >
            <span>نشانونه او بریاوې لیدل</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Daily Tips of the day section: confidence & speaking tips side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speaking tip */}
        <div className={`p-5 rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow-sm space-y-4`}>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-right">
              <h4 className="text-xs font-extrabold text-[#111] dark:text-white leading-normal">د کلام او غږ د لوړوالي لارښوونه</h4>
              <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">daily speaking tip</span>
            </div>
          </div>

          <p className="text-xs text-justify text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
            {dailySpeakingTip?.content || "د خبرو پر مهال چوپتیا يا وقفه (Pause) غوره کړئ؛ دا مخاطب ته په مهمو شیانو کې د تفکر فرصت ورکوي."}
          </p>
        </div>

        {/* Confidence tip */}
        <div className={`p-5 rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow-sm space-y-4`}>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500/10 text-teal-500 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-right">
              <h4 className="text-xs font-extrabold text-[#111] dark:text-white leading-normal">په ځان د باور لوړولو لارښوونه</h4>
              <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">confidence wisdom</span>
            </div>
          </div>

          <p className="text-xs text-justify text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
            {dailyConfidenceTip?.content || "په ښيښه کې خپل ځان ته په توده سترګه وګورئ او تایید کړئ چې تاسو بريالي یاست."}
          </p>
        </div>
      </div>

      {/* Deterministic Lesson of the Day Row */}
      <div className={`p-5 rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow-sm`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 text-right">
            <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              د ورځي وړاندیز شوې زده کړه
            </span>
            <h3 className="text-base font-extrabold text-[#111] dark:text-white pt-1">
              {featuredLesson.title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ډلبندي: <strong>{featuredLesson.category}</strong> | د ويلو وخت: {featuredLesson.readingTime}
            </p>
          </div>

          <button
            onClick={() => {
              onSetActiveLessonId(featuredLesson.id);
              onNavigateToTab("lessons");
            }}
            className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border font-bold text-xs rounded-xl hover:scale-105 transition"
          >
            سفر پیل کړئ
          </button>
        </div>
      </div>

      {/* Motivational Center Carousel / Inspirational Quotes */}
      <div className="p-6 rounded-3xl bg-neutral-100 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden space-y-4">
        <Quote className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto opacity-50" />

        <div className="space-y-2">
          <p className="text-sm md:text-base font-bold italic text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-xl mx-auto">
            «{featuredQuote?.content}»
          </p>
          {featuredQuote?.author && (
            <span className="text-xs font-mono text-zinc-400 block">— {featuredQuote.author}</span>
          )}
        </div>
      </div>
    </div>
  );
}
