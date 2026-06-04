/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Shield, Sparkles, Trophy, ChevronRight, ChevronLeft, ArrowRight, User } from "lucide-react";
import { ThemeConfig } from "../types";

interface OnboardingProps {
  onComplete: (name: string, gender: "male" | "female" | "other", goals: string[]) => void;
  theme: ThemeConfig;
}

export default function SplashAndOnboarding({ onComplete, theme }: OnboardingProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Simulation of splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const goalsList = [
    { id: "g1", label: "له سټېج او خلکو د وېرې ماتول", desc: "پر سټېج باندې د ډاډ غښتلتیا" },
    { id: "g2", label: "د بدني ژبې (باډي لېنګوېج) سمون", desc: "د مناسبو لاسونو او سترګو د توازن کارول" },
    { id: "g3", label: "د غږ پیاوړتیا او د وقفو توازن", desc: "د غږ تېزوالی، ساه اخيستنه او انګازه" },
    { id: "g4", label: "د عالي او زړه راښونکي شخصیت جوړونه", desc: "په ټولنه کې د روښانه او اغېزناک بيان لرلو هنر" },
  ];

  const handleToggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      return; // Name required to proceed!
    }
    if (step === 2) {
      onComplete(name.trim(), gender, selectedGoals);
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  // Splash design
  if (showSplash) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center ${theme.bgDark} text-white z-50 overflow-hidden select-none`}>
        {/* Glow Effects */}
        <div className="absolute w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full -top-10 -right-10 pointer-events-none" />
        <div className="absolute w-72 h-72 bg-teal-500/10 blur-3xl rounded-full -bottom-10 -left-10 pointer-events-none" />

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: [0.7, 1.05, 1], opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center px-6"
        >
          {/* Animated Wave Ring / Logo Container */}
          <div className="relative mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-md opacity-75"
            />
            <div className="relative bg-gradient-to-tr from-emerald-600 to-teal-800 p-6 rounded-full shadow-2xl border-2 border-emerald-400/30">
              <Mic className="w-16 h-16 text-emerald-100" />
            </div>
          </div>

          <motion.h1
            initial={{ letterSpacing: "0.1em", opacity: 0 }}
            animate={{ letterSpacing: "0.2em", opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-100 to-amber-300 font-sans tracking-wide mb-3"
            dir="rtl"
          >
            ویناوال
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-emerald-400 text-sm font-mono uppercase tracking-widest mb-10"
          >
            v e n a w a l &bull; o r a t o r
          </motion.p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 140 }}
            transition={{ delay: 1.2, duration: 1.2, ease: "easeInOut" }}
            className="h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="text-xs text-emerald-200/60 mt-4 max-w-xs leading-relaxed"
            dir="rtl"
          >
            ستاسو د شخصي جرات او عالي مفاهمې تلپاتی ملګری
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center p-4 md:p-8 ${theme.bgLight} dark:${theme.bgDark} overflow-y-auto duration-500 transition-colors z-40 select-none`} dir="rtl">
      {/* Visual Ambient Background Splotches */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full max-w-xl ${theme.cardLight} dark:${theme.cardDark} rounded-3xl p-6 md:p-8 shadow-2xl duration-300 relative overflow-hidden backdrop-blur-xl border border-emerald-500/20`}>
        {/* Onboarding Steps Indicators */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/40">
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase">مرحله {step + 1} له ۳ څخه</span>
          <div className="flex gap-1.5 direction-ltr">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === step
                    ? "w-8 bg-gradient-to-r from-emerald-500 to-teal-500"
                    : idx < step
                    ? "w-2 bg-emerald-400"
                    : "w-2 bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex bg-gradient-to-r from-emerald-500/15 to-teal-500/15 p-4 rounded-2xl border border-emerald-500/30">
                  <Sparkles className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white leading-normal">
                  «ویناوال» ته ښه راغلاست!
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-md mx-auto">
                  د پښتو ژبې د عامه ويناوالۍ، په ځان د باور لوړولو، له خلکو د وېرې ماتولو او د غوره شخصيت جوړونې تر ټولو غښتلې روزنیزه لاره.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                <div className="bg-zinc-100/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-zinc-200/30 dark:border-zinc-800/20 flex flex-col items-center text-center">
                  <Shield className="w-6 h-6 text-emerald-500 mb-2" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">کامل باور او جرئت</span>
                </div>
                <div className="bg-zinc-100/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-zinc-200/30 dark:border-zinc-800/20 flex flex-col items-center text-center">
                  <Mic className="w-6 h-6 text-emerald-500 mb-2" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">عملي غږ ثبت کونکی</span>
                </div>
                <div className="bg-zinc-100/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-zinc-200/30 dark:border-zinc-800/20 flex flex-col items-center text-center">
                  <Trophy className="w-6 h-6 text-emerald-500 mb-2" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">نمرې او زېرمې</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white">
                  خپل معلومات معرفي کړئ
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  دا نوم به ستاسو په عالي بريا ليک او شهادتنامه کې ليکل کېږي.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">خپل پوره او اصلي نوم:</label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="rtl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="لکه: احمد ولي، ملالۍ..."
                      className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 pr-12 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm border border-zinc-200/40 dark:border-zinc-700/50"
                    />
                    <User className="w-5 h-5 text-zinc-400 dark:text-zinc-500 absolute top-4 right-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">جنسیت (د مناسبو خطابونو لپاره):</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 ${
                        gender === "male"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 dark:text-emerald-400 shadow-md"
                          : "bg-zinc-100/50 dark:bg-zinc-800/10 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      ورور (نارینه)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 ${
                        gender === "female"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 dark:text-emerald-400 shadow-md"
                          : "bg-zinc-100/50 dark:bg-zinc-800/10 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      خور (ښځینه)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white">
                  ستاسو عمده اهداف کوم دي؟
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  هغه موضوعات وټاکئ چې زیات پرمختګ غواړئ ورپکې وکړو.
                </p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {goalsList.map((g) => {
                  const isSelected = selectedGoals.includes(g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => handleToggleGoal(g.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/60 dark:bg-emerald-950/45 text-emerald-950 dark:text-emerald-200"
                          : "bg-zinc-100/50 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800/40 text-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all ${
                        isSelected ? "bg-emerald-600 border-emerald-500 text-white" : "border-zinc-300 dark:border-zinc-700"
                      }`}>
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-sm font-bold">{g.label}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{g.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons Action */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40">
          {step > 0 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              مخکینی
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={step === 1 && !name.trim()}
            className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-sm shadow-md transition-all ${
              step === 1 && !name.trim() ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            <span>{step === 2 ? "کورس پیلول" : "مخکې لاړ شه"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
