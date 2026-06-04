/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Check, Award, Flame, Zap, Calendar, Smile, RefreshCw, Star, Info } from "lucide-react";
import { CourageTask, ThemeConfig } from "../types";
import { DAILY_COURAGE_TASKS } from "../data/tips";

interface ConfidenceTabProps {
  theme: ThemeConfig;
  completedTasks: string[]; // list of taskIDs completed
  onCompleteTask: (id: string, xpReward: number) => void;
  streakCount: number;
}

export default function ConfidenceTab({
  theme,
  completedTasks,
  onCompleteTask,
  streakCount,
}: ConfidenceTabProps) {
  const [activeTaskInfoId, setActiveTaskInfoId] = useState<string | null>(null);

  // Compute stats
  const totalTasks = DAILY_COURAGE_TASKS.length;
  const doneCount = DAILY_COURAGE_TASKS.filter((t) => completedTasks.includes(t.id)).length;
  const progressPercent = Math.round((doneCount / totalTasks) * 100) || 0;

  const handleCompleteWithAnimation = (task: CourageTask) => {
    if (completedTasks.includes(task.id)) return;
    onCompleteTask(task.id, task.xpReward);
  };

  const getConfidenceTitle = (percent: number) => {
    if (percent >= 90) return "شاهي جراتمند (ويناوال اتل)";
    if (percent >= 60) return "زړور مبارز (پیاوړی غږ)";
    if (percent >= 30) return "پيل کوونکی زړور (امېد لرونکی)";
    return "بې سارى همکار (پياوړيتوب پیلوونکی)";
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <Shield className="text-emerald-500 w-7 h-7" />
          د جرئت او اعتماد روزنیز مرکز
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          هره ورځ د دغو مېړانو او د جرئت ننګونو څخه يو تمرين وکړئ ترڅو ستاسو د سنيګ پر سر او د خبرو وېره په بشپړ ډول ماته شي.
        </p>
      </div>

      {/* Confidence Level progress ring / banner */}
      <div className={`p-6 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 w-36 h-36 bg-white/5 rounded-full blur-xl" />
        <div className="absolute left-0 top-0 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 md:col-span-2 text-right">
            <span className="text-[10px] bg-white/25 text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              زما د جرئت درجه او مقام
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold pb-1">
              {getConfidenceTitle(progressPercent)}
            </h3>
            <p className="text-xs text-emerald-250 leading-relaxed max-w-md">
              هرکله چې تاسو د خلکو او هټۍ والو ترمنځ ننګونه اخلئ، د ځان غښتلتیا رول مخکې ځي او د عامه مفاهمې نوی غړی جوړوي.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-emerald-200">بشپړ شوي ننګونې:</span>
            <span className="text-3xl font-mono font-extrabold text-emerald-100 my-1">{doneCount} <span className="text-xs text-white">له {totalTasks}</span></span>
            {/* Horizontal mini progress bar */}
            <div className="w-full bg-white/20 h-2 rounded-full mt-2 relative overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-300 font-mono mt-1">{progressPercent}% بشپړ شوی</span>
          </div>
        </div>
      </div>

      {/* Grid of Challenges */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-150 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-emerald-500" />
          زما د ورځني جرئت تمرینات او د ډار ماتولو ننګونې
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DAILY_COURAGE_TASKS.map((task, idx) => {
            const isCompleted = completedTasks.includes(task.id);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all duration-305 flex flex-col justify-between ${
                  isCompleted
                    ? "bg-green-500/5 dark:bg-green-500/10 border-green-500/30 text-zinc-900 dark:text-white"
                    : "bg-white dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/80 hover:shadow-md hover:scale-[1.01]"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-2.5">
                    {/* Tick box button */}
                    <button
                      onClick={() => handleCompleteWithAnimation(task)}
                      disabled={isCompleted}
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                    </button>

                    <div className="flex flex-col text-right space-y-1">
                      <span className={`text-xs font-bold leading-relaxed ${isCompleted ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-850 dark:text-zinc-100"}`}>
                        {task.task}
                      </span>
                      <span className="text-[10px] text-amber-500 font-mono">+ {task.xpReward} XP نمرې</span>
                    </div>
                  </div>

                  {/* Info helper icon */}
                  <button
                    onClick={() => setActiveTaskInfoId(activeTaskInfoId === task.id ? null : task.id)}
                    className="p-1 text-zinc-400 hover:text-emerald-500 transition"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expanded guidance text drawer */}
                {activeTaskInfoId === task.id && (
                  <div className="mt-3 p-3 bg-zinc-100/50 dark:bg-zinc-950/20 rounded-xl border border-zinc-200/50 dark:border-zinc-850 text-[10px] text-zinc-600 dark:text-zinc-400 text-justify leading-relaxed">
                    <strong>سپارښتنه:</strong> دغه ننګونه په خندا سره پرته له دې چې د نورو ليد مو د تشويش لامل وګرځي عملي کړئ. دا چاره ستاسو د پر سټېج خبرو د پټي وېري رښتينی هورمون کنټرولوي او تاسو د مفاهمې سحر لور ته بيايي.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
