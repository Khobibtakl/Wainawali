/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Heart,
  BookMarked,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  PlusCircle,
  Pencil,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Check,
  Play,
  RotateCcw
} from "lucide-react";
import { Lesson, ThemeConfig } from "../types";
import { LESSONS } from "../data/lessons";

interface LessonsTabProps {
  theme: ThemeConfig;
  completedLessons: string[];
  favorites: string[];
  customNotes: Record<string, string>;
  onToggleFavorite: (id: string) => void;
  onMarkComplete: (id: string) => void;
  onSaveNote: (lessonId: string, text: string) => void;
  onAddXp: (amount: number) => void;
  completedQuizzes: Record<string, number>;
  onQuizComplete: (lessonId: string, scorePercent: number) => void;
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
}

export default function LessonsTab({
  theme,
  completedLessons,
  favorites,
  customNotes,
  onToggleFavorite,
  onMarkComplete,
  onSaveNote,
  onAddXp,
  completedQuizzes,
  onQuizComplete,
  activeLessonId,
  setActiveLessonId,
}: LessonsTabProps) {
  // Navigation & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Notes state
  const [tempNoteText, setTempNoteText] = useState("");
  const [noteStatus, setNoteStatus] = useState("");

  // Speech (TTS) simulation states
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [activeSpeechParagraphIdx, setActiveSpeechParagraphIdx] = useState<number | null>(null);
  const speechIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lesson Detail Quiz States
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuizQuestionIdx, setCurrentQuizQuestionIdx] = useState(0);
  const [selectedQuizOptionIdx, setSelectedQuizOptionIdx] = useState<number | null>(null);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Get active lesson
  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) || null;

  // On opening a lesson, initialize temporary note text
  useEffect(() => {
    if (activeLesson) {
      setTempNoteText(customNotes[activeLesson.id] || "");
      setNoteStatus("");
      // Reset quiz
      setQuizStarted(false);
      setCurrentQuizQuestionIdx(0);
      setSelectedQuizOptionIdx(null);
      setQuizAnswerChecked(false);
      setQuizScore(0);
      setQuizFinished(false);
      // Reset speech simulation
      stopReadingAloud();
    }
  }, [activeLessonId, customNotes]);

  // Handle Search and category lists
  const categories = ["all", "بنسټونه", "جرئت او غبرګون", "په ځان باور", "مهارتونه", "د وړاندې کولو هنر", "شخصيت جوړونه"];

  const filteredLessons = LESSONS.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.content.some((par) => par.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSaveNoteLocal = () => {
    if (activeLesson) {
      onSaveNote(activeLesson.id, tempNoteText);
      setNoteStatus("ستاسو یادښت په برياليتوب سره خوندي شو!");
      setTimeout(() => setNoteStatus(""), 3000);
      onAddXp(5); // Mini Reward for writing notes!
    }
  };

  // Text To Speech (TTS) Animation Simulator
  const startReadingAloud = () => {
    if (!activeLesson) return;
    setIsReadingAloud(true);
    setActiveSpeechParagraphIdx(0);

    // Speak real text using web voice engine fallback
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // Try to read paragraphs
      const textToSpeak = activeLesson.content.join(". ");
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      // Fallback voice language configuration
      utterance.lang = "ps"; // Pashto if supported
      utterance.rate = 0.9;
      utterance.onend = () => {
        stopReadingAloud();
      };
      window.speechSynthesis.speak(utterance);
    }

    let currentIdx = 0;
    speechIntervalRef.current = setInterval(() => {
      currentIdx++;
      if (currentIdx < activeLesson.content.length) {
        setActiveSpeechParagraphIdx(currentIdx);
      } else {
        stopReadingAloud();
      }
    }, 4500); // Highlight paragraphs sequentially every 4.5 seconds
  };

  const stopReadingAloud = () => {
    setIsReadingAloud(false);
    setActiveSpeechParagraphIdx(null);
    if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Quiz Handling
  const handleSelectQuizOption = (idx: number) => {
    if (quizAnswerChecked) return;
    setSelectedQuizOptionIdx(idx);
  };

  const handleCheckQuizAnswer = () => {
    if (selectedQuizOptionIdx === null || !activeLesson) return;
    setQuizAnswerChecked(true);

    const question = activeLesson.quiz[currentQuizQuestionIdx];
    if (selectedQuizOptionIdx === question.correctOptionIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (!activeLesson) return;

    setSelectedQuizOptionIdx(null);
    setQuizAnswerChecked(false);

    if (currentQuizQuestionIdx + 1 < activeLesson.quiz.length) {
      setCurrentQuizQuestionIdx((prev) => prev + 1);
    } else {
      // Finished Quiz
      setQuizFinished(true);
      const totalQuestions = activeLesson.quiz.length;
      const percent = Math.round((quizScore / totalQuestions) * 100);

      onQuizComplete(activeLesson.id, percent);

      // Reward XP for correct answers
      const earnedXp = quizScore * 15;
      onAddXp(earnedXp);

      // Mark the lesson completed after taking the quiz!
      onMarkComplete(activeLesson.id);
    }
  };

  const resetQuiz = () => {
    setQuizFinished(false);
    setQuizStarted(true);
    setCurrentQuizQuestionIdx(0);
    setSelectedQuizOptionIdx(null);
    setQuizAnswerChecked(false);
    setQuizScore(0);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* If active lesson has been selected, view full lesson details */}
      {activeLesson ? (
        <div className="space-y-6 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => {
              stopReadingAloud();
              setActiveLessonId(null);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بېرته درسونو لیست ته تلل</span>
          </button>

          {/* Elegant Cover Hero Grid */}
          <div className="bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-800 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            {/* Ambient Background Circles */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold px-3 py-1 bg-white/20 rounded-full">{activeLesson.category}</span>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mt-1">{activeLesson.title}</h1>
                <p className="text-xs text-emerald-250 font-mono mt-2">د لوستلو وخت: {activeLesson.readingTime} | اډيو: {activeLesson.audioDuration}</p>
              </div>

              {/* Action items like favorite */}
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleFavorite(activeLesson.id)}
                  className={`p-3 rounded-full border transition ${
                    favorites.includes(activeLesson.id)
                      ? "bg-rose-500/80 border-rose-400 text-white"
                      : "bg-white/10 hover:bg-white/25 border-white/20 text-emerald-100"
                  }`}
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>

                {/* Text To Speech Control inside cover bar */}
                {isReadingAloud ? (
                  <button
                    onClick={stopReadingAloud}
                    className="p-3 rounded-full bg-amber-500 border border-amber-400 text-white transition animate-bounce"
                    title="غږ تم کول"
                  >
                    <VolumeX className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={startReadingAloud}
                    className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-white transition"
                    title="لوستل په لوړ اواز"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lesson Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Main Text Content Visual Panel */}
              <div className={`p-6 md:p-8 rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow-md space-y-6`}>
                {activeLesson.content.map((paragraph, index) => {
                  const isHighlighted = activeSpeechParagraphIdx === index;
                  return (
                    <p
                      key={index}
                      className={`text-[15px] md:text-base leading-loose text-justify duration-300 rounded-lg p-2 ${
                        isHighlighted
                          ? "bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-amber-500 text-amber-950 dark:text-amber-200 font-bold scale-[1.01]"
                          : "text-zinc-800 dark:text-zinc-200 border-l-4 border-transparent"
                      }`}
                    >
                      {paragraph}
                    </p>
                  );
                })}

                {/* Mark as read manual button at the bottom */}
                <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40 flex justify-between items-center">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {completedLessons.includes(activeLesson.id) ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4 border border-emerald-500 rounded-full p-0.5" />
                        تاسو دا درس لوستی دی!
                      </span>
                    ) : (
                      <span>تاسو لا دا درس نه دی بشپړ کړی.</span>
                    )}
                  </div>

                  {!completedLessons.includes(activeLesson.id) && (
                    <button
                      onClick={() => {
                        onMarkComplete(activeLesson.id);
                        onAddXp(25);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:from-teal-500 text-white text-xs font-bold rounded-xl transition shadow"
                    >
                      لوستل پای ته ورسول (+۲۵ XP)
                    </button>
                  )}
                </div>
              </div>

              {/* Notes panel under the current lesson */}
              <div className={`p-6 rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow-sm space-y-4`}>
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-150 flex items-center gap-1.5 uppercase">
                  <Pencil className="w-4 h-4 text-emerald-500" />
                  زما ځانګړي نوټونه او یادښتونه د همدې درس پاڼې لاندې
                </h3>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    placeholder="له دغه درسه مو څه زده کړل؟ خپل فکرونه، مهم جملې یا لنډ ټکي دلته په پښتو وليکئ او خوندي کړئ..."
                    value={tempNoteText}
                    onChange={(e) => setTempNoteText(e.target.value)}
                    className="w-full text-right p-3.5 text-xs bg-zinc-100/60 dark:bg-zinc-950/40 text-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-zinc-200 dark:border-zinc-800"
                  />

                  {noteStatus && (
                    <p className="text-emerald-500 text-xs font-medium animate-pulse">{noteStatus}</p>
                  )}

                  <button
                    onClick={handleSaveNoteLocal}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-xs font-bold rounded-xl text-zinc-850 dark:text-zinc-200 border border-zinc-250 dark:border-zinc-800/80 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    خوندي کول
                  </button>
                </div>
              </div>
            </div>

            {/* Quiz panel on the side */}
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow-md`}>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                  د یادښت ارزونې لنډه ازموینه (کوېز)
                </h3>

                {!quizStarted && !quizFinished ? (
                  <div className="space-y-4 pt-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      دا درس په غور سره ولولئ او د سیند جوړونې او عالي پوهې د ارزونې لپاره دا ازموینه پر مخ بوځئ د لوړې نمرې په بستر کې!
                    </p>
                    {completedQuizzes[activeLesson.id] !== undefined && (
                      <div className="text-xs p-2.5 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-500/20">
                        ستاسو د تېرې هڅې لوړه نمره: <strong>{completedQuizzes[activeLesson.id]}%</strong>
                      </div>
                    )}
                    <button
                      onClick={() => setQuizStarted(true)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs"
                    >
                      کوېز پیل کړئ
                    </button>
                  </div>
                ) : quizFinished ? (
                  <div className="text-center space-y-4 pt-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-zinc-800 dark:text-zinc-150">ازموینه پای ته ورسېده!</h4>
                      <p className="text-xs text-zinc-500">ستاسو نمره: {Math.round((quizScore / activeLesson.quiz.length) * 100)}%</p>
                      <p className="text-xs text-amber-500">کټ شوې نمرې: +{quizScore * 15} XP</p>
                    </div>

                    <button
                      onClick={resetQuiz}
                      className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-xs font-bold rounded-xl text-zinc-800 dark:text-zinc-200"
                    >
                      بیا آزموینه
                    </button>
                  </div>
                ) : (
                  /* Live test wizard */
                  <div className="space-y-5 pt-2">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span>سوال {currentQuizQuestionIdx + 1} له {activeLesson.quiz.length} څخه</span>
                      <span>سلسله</span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-100 leading-relaxed">
                      {activeLesson.quiz[currentQuizQuestionIdx].question}
                    </h4>

                    {/* Choices container */}
                    <div className="space-y-2">
                      {activeLesson.quiz[currentQuizQuestionIdx].options.map((option, idx) => {
                        const isSelected = selectedQuizOptionIdx === idx;
                        const isCorrect = activeLesson.quiz[currentQuizQuestionIdx].correctOptionIndex === idx;

                        let btnStyle = "border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300";

                        if (isSelected) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold";
                        }

                        if (quizAnswerChecked) {
                          if (isCorrect) {
                            btnStyle = "bg-green-500/15 border-green-500 text-green-750 dark:text-green-300 font-bold";
                          } else if (isSelected) {
                            btnStyle = "bg-red-500/15 border-red-500 text-red-750 dark:text-red-300";
                          } else {
                            btnStyle = "opacity-50 border-zinc-200/40 dark:border-zinc-800/20";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizOption(idx)}
                            disabled={quizAnswerChecked}
                            className={`w-full p-3 rounded-xl border text-right text-xs transition-all flex items-start gap-2 ${btnStyle}`}
                          >
                            <span className="font-mono">{idx + 1}.</span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if checked */}
                    {quizAnswerChecked && (
                      <div className="p-3 bg-zinc-100/70 dark:bg-zinc-950/50 rounded-xl border border-zinc-200/50 dark:border-zinc-850 text-[11px] text-justify leading-relaxed text-zinc-650 dark:text-zinc-350">
                        <strong>لارښوونه:</strong> {activeLesson.quiz[currentQuizQuestionIdx].explanation}
                      </div>
                    )}

                    {/* Controls */}
                    <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/40">
                      {!quizAnswerChecked ? (
                        <button
                          onClick={handleCheckQuizAnswer}
                          disabled={selectedQuizOptionIdx === null}
                          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow disabled:opacity-50"
                        >
                          ځواب تایید کړئ
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="w-full py-2 bg-zinc-855 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow hover:bg-zinc-755 transition"
                        >
                          {currentQuizQuestionIdx + 1 === activeLesson.quiz.length ? "پایلې لیدل" : "بل سوال ته لاړ شه"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Regular list of lessons with search and instant filtering */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <BookMarked className="text-emerald-500 w-7 h-7" />
                د ويناوال کدر بېلابېل درسونه
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                هر لوست د سیند جوړونې او عالي بیان یو شاهکار دی، تمرينونه کوئ او نمرې مو زياتې کړئ.
              </p>
            </div>

            {/* Smart Search Bar */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="دلته فوراً پلټنه (کتاب، مضمون)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pr-10 text-xs text-right bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute top-3.5 right-3.5" />
            </div>
          </div>

          {/* Quick Category Tabs scrollbar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-350"
                }`}
              >
                {cat === "all" ? "کتابتون (ټول)" : cat}
              </button>
            ))}
          </div>

          {/* Main List of Cards */}
          {filteredLessons.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-2xl bg-white/40 dark:bg-zinc-950/20">
              <BookOpen className="w-12 h-12 text-zinc-350 dark:text-zinc-700 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">هیڅ مضمون ونه موندل شو</h4>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">مهرباني وکړی بل کوم نوم وګورئ.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isFav = favorites.includes(lesson.id);
                const progressPercent = isCompleted ? 100 : 0; // simple completion metric

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border ${theme.cardLight} dark:${theme.cardDark} shadow-md overflow-hidden hover:shadow-xl duration-300 flex flex-col justify-between align-stretch text-right hover:scale-[1.01]`}
                  >
                    {/* Glowing Accent Top border */}
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />

                    <div className="p-5 flex-1 space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            {lesson.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(lesson.id);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 transition"
                          >
                            <Heart className={`w-4.5 h-4.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>
                        </div>

                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug">
                          {lesson.title}
                        </h3>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {lesson.content[0]}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40 flex justify-between items-center text-[10px] text-zinc-550">
                        <span className="font-mono">لوست: {lesson.readingTime}</span>
                        {isCompleted ? (
                          <span className="text-emerald-500 font-extrabold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            بشپړ شوی
                          </span>
                        ) : (
                          <span className="text-zinc-400">نه لوستل کونکی</span>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => setActiveLessonId(lesson.id)}
                      className="w-full text-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all border-t border-emerald-400/20"
                    >
                      مضمون لوستل پیل کړئ
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
