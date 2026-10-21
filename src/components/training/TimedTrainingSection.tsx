import React, { useState, useEffect, useRef, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';
import { fireSuccessConfetti, stopConfetti } from '../../utils/confetti';
import {
  ArenaChallenge,
  CodeLanguage,
  PersonalBestRecord,
  ProblemSheet,
  TrainingStats
} from '../../types';
import { INITIAL_QUESTION_BANK } from '../../data/questionBank';
import {
  getAllTrainingProblems,
  getAllPersonalBests,
  recordProblemTime,
  getTrainingStats,
  RecordTimeResult
} from '../../services/trainingService';
import {
  executeCodeSandbox,
  evaluateTestCases,
  EvaluationSummary,
  RunResult,
  normalizeError
} from '../../utils/codeRunner';
import {
  Timer,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Search,
  ArrowRight,
  ArrowLeft,
  Code2,
  Terminal,
  Send,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  List,
  Eye,
  EyeOff,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';

export interface TimedTrainingSectionProps {
  initialProblemId?: string;
  onBackToHub?: () => void;
  onCloseHub?: () => void;
  onOpenArena?: () => void;
  isActive?: boolean;
  onStatsUpdated?: () => void;
}

function getDefaultStarterTemplate(lang: CodeLanguage): string {
  switch (lang) {
    case 'python':
      return `# Write solution\nline = input()\nprint(line)\n`;
    case 'javascript':
      return `// Write solution\nfunction solve(stdin) {\n  console.log(stdin);\n}\nsolve(stdin);\n`;
    case 'cpp':
      return `#include <iostream>\n\nint main() {\n    return 0;\n}\n`;
    case 'c':
      return `#include <stdio.h>\n\nint main() {\n    return 0;\n}\n`;
  }
}

export const TimedTrainingSection: React.FC<TimedTrainingSectionProps> = ({
  initialProblemId,
  onBackToHub,
  onCloseHub,
  onOpenArena,
  isActive = true,
  onStatsUpdated
}) => {
  const { addXp } = useGame();

  // Screen View: 'catalog' | 'training' | 'victory'
  const [view, setView] = useState<'catalog' | 'training' | 'victory'>('catalog');

  // Problems and Personal Bests
  const [allProblems, setAllProblems] = useState<ArenaChallenge[]>([]);
  const [personalBests, setPersonalBests] = useState<Record<string, PersonalBestRecord>>({});
  const [trainingStats, setTrainingStats] = useState<TrainingStats>({
    totalSolved: 0,
    recordsBeaten: 0,
    totalTrainingTimeSeconds: 0
  });
  const [, setLoading] = useState(false);

  // Filters
  const [selectedSheet, setSelectedSheet] = useState<ProblemSheet>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Training Problem
  const [activeProblem, setActiveProblem] = useState<ArenaChallenge | null>(null);

  // Live Timer: high-precision timestamp-based timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);
  const isTimerRunningRef = useRef<boolean>(false);

  // Live Code Environment
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('python');
  const [code, setCode] = useState<string>('');
  const [customStdin, setCustomStdin] = useState<string>('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'output' | 'tests' | 'custom_input'>('output');

  // Execution & Test State
  const [isRunning, setIsRunning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationSummary | null>(null);

  // Submission lock and duplicate event prevention
  const isSubmittingRef = useRef<boolean>(false);
  const hasRecordedResultRef = useRef<boolean>(false);
  const activeProblemRef = useRef<ArenaChallenge | null>(null);

  // Victory Record Result
  const [solveRecordResult, setSolveRecordResult] = useState<RecordTimeResult | null>(null);

  // Mobile responsive views and drawer state
  const [mobileTab, setMobileTab] = useState<'problem' | 'code' | 'tests'>('problem');
  const [isProblemDrawerOpen, setIsProblemDrawerOpen] = useState(false);
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');
  const [drawerSheet, setDrawerSheet] = useState<ProblemSheet>('all');

  // Attempt-first solution disclosure & hints state
  const [revealedHintsCount, setRevealedHintsCount] = useState<number>(0);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState<boolean>(false);
  const [solutionLanguage, setSolutionLanguage] = useState<CodeLanguage>('python');
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);

  // Textarea & Syntax highlight sync
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Helper to calculate exact elapsed seconds without drift
  const getElapsedSeconds = () => {
    if (!startTimeRef.current) return accumulatedSecondsRef.current;
    const currentRun = Math.floor((Date.now() - startTimeRef.current) / 1000);
    return accumulatedSecondsRef.current + Math.max(0, currentRun);
  };

  const pauseTimer = () => {
    if (startTimeRef.current) {
      accumulatedSecondsRef.current += Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
      startTimeRef.current = null;
    }
    isTimerRunningRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedSeconds(accumulatedSecondsRef.current);
  };

  const stopTimer = () => {
    pauseTimer();
  };

  const startTimer = (resume = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!resume) {
      accumulatedSecondsRef.current = 0;
      setElapsedSeconds(0);
    }
    startTimeRef.current = Date.now();
    isTimerRunningRef.current = true;

    timerRef.current = setInterval(() => {
      const current = getElapsedSeconds();
      setElapsedSeconds(current);
    }, 500);
  };

  // Launch training session on a selected problem
  const startTrainingOnProblem = (problem: ArenaChallenge) => {
    sound.playClick();
    activeProblemRef.current = problem;
    setActiveProblem(problem);
    const template =
      problem.starterTemplates?.[selectedLanguage] ||
      getDefaultStarterTemplate(selectedLanguage);
    setCode(template);
    setRunResult(null);
    setEvaluationResult(null);
    setSolveRecordResult(null);
    hasRecordedResultRef.current = false;
    isSubmittingRef.current = false;
    setRevealedHintsCount(0);
    setIsSolutionRevealed(false);
    setShowSolutionConfirm(false);
    setCopiedSolution(false);
    setView('training');
    setMobileTab('problem');
    startTimer(false);
  };

  // Reset solution disclosure and hints whenever active problem changes to prevent leakage across problems
  useEffect(() => {
    setRevealedHintsCount(0);
    setIsSolutionRevealed(false);
    setShowSolutionConfirm(false);
    setCopiedSolution(false);
    if (activeProblem?.solutions) {
      const langs = Object.keys(activeProblem.solutions) as CodeLanguage[];
      if (langs.length > 0) {
        setSolutionLanguage(langs.includes(selectedLanguage) ? selectedLanguage : langs[0]);
      }
    }
  }, [activeProblem?.id]);

  const activeProblemSolutions = activeProblem?.solutions;
  const availableSolutionLangs = useMemo(() => {
    if (!activeProblemSolutions) return [];
    return Object.keys(activeProblemSolutions) as CodeLanguage[];
  }, [activeProblemSolutions]);

  const currentSolutionCode = useMemo(() => {
    if (!activeProblemSolutions) return '';
    return (
      activeProblemSolutions[solutionLanguage] ||
      activeProblemSolutions[selectedLanguage] ||
      Object.values(activeProblemSolutions)[0] ||
      ''
    );
  }, [activeProblemSolutions, solutionLanguage, selectedLanguage]);

  const handleCopySolution = () => {
    if (!currentSolutionCode) return;
    navigator.clipboard.writeText(currentSolutionCode);
    setCopiedSolution(true);
    sound.playClick();
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const handleLoadSolutionIntoEditor = () => {
    if (!currentSolutionCode) return;
    handleSelectLanguage(solutionLanguage);
    setCode(currentSolutionCode);
    sound.playSuccess();
    setMobileTab('code');
  };

  const isComponentMountedRef = useRef(true);
  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      pauseTimer();
      stopConfetti();
    };
  }, []);

  useEffect(() => {
    activeProblemRef.current = activeProblem;
  }, [activeProblem]);

  // Pause timer if section becomes inactive (e.g. user navigated to Hub tab), resume when back
  useEffect(() => {
    if (isActive === false) {
      if (view === 'training' && isTimerRunningRef.current) {
        pauseTimer();
      }
    } else if (isActive === true) {
      if (view === 'training' && activeProblem && !isTimerRunningRef.current && !solveRecordResult) {
        startTimer(true);
      }
    }
  }, [isActive, view, activeProblem?.id, solveRecordResult]);

  // Load problems and personal bests on mount or when initialProblemId changes
  const prevInitialProblemIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAllTrainingProblems()
      .then(problems => {
        if (!isMounted) return;
        setAllProblems(problems);
        setPersonalBests(getAllPersonalBests());
        setTrainingStats(getTrainingStats());

        if (initialProblemId && initialProblemId !== prevInitialProblemIdRef.current) {
          prevInitialProblemIdRef.current = initialProblemId;
          const found = problems.find(
            p => p.id === initialProblemId || p.slug === initialProblemId
          );
          if (found) {
            startTrainingOnProblem(found);
          } else {
            const fallback = INITIAL_QUESTION_BANK.find(
              p => p.id === initialProblemId || p.slug === initialProblemId
            );
            if (fallback) {
              const fullFallback: ArenaChallenge = {
                ...fallback,
                sheets: (fallback.sheets || ['questionbank']) as ArenaChallenge['sheets']
              };
              setAllProblems(prev => [...prev, fullFallback]);
              startTrainingOnProblem(fullFallback);
            }
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      pauseTimer();
      stopConfetti();
    };
  }, [initialProblemId]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      pauseTimer();
      stopConfetti();
    };
  }, []);

  // Update starter code ONLY when selected language changes
  const prevLangRef = useRef<CodeLanguage>(selectedLanguage);
  useEffect(() => {
    if (activeProblem && view === 'training') {
      if (prevLangRef.current !== selectedLanguage) {
        prevLangRef.current = selectedLanguage;
        const template =
          activeProblem.starterTemplates?.[selectedLanguage] ||
          getDefaultStarterTemplate(selectedLanguage);
        setCode(template);
        setRunResult(null);
        setEvaluationResult(null);
      }
    }
  }, [selectedLanguage, activeProblem?.id, view]);

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProblems.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [allProblems]);

  // Filtered problems based on sheet, category, and search query
  const filteredProblems = useMemo(() => {
    return allProblems.filter(p => {
      let sheetMatch = true;
      if (selectedSheet === 'neetcode75') {
        sheetMatch = !!p.sheets?.includes('neetcode75');
      } else if (selectedSheet === 'neetcode150') {
        sheetMatch = !!p.sheets?.includes('neetcode150');
      } else if (selectedSheet === 'questionbank') {
        sheetMatch = !!p.sheets?.includes('questionbank') || !!p.isCommunity;
      }

      const catMatch =
        selectedCategory === 'all' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const searchMatch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      return sheetMatch && catMatch && searchMatch;
    });
  }, [allProblems, selectedSheet, selectedCategory, searchQuery]);

  // Filtered problems for the mobile problem list drawer
  const filteredDrawerProblems = useMemo(() => {
    return allProblems.filter(p => {
      let sheetMatch = true;
      if (drawerSheet === 'neetcode75') {
        sheetMatch = !!p.sheets?.includes('neetcode75');
      } else if (drawerSheet === 'neetcode150') {
        sheetMatch = !!p.sheets?.includes('neetcode150');
      } else if (drawerSheet === 'questionbank') {
        sheetMatch = !!p.sheets?.includes('questionbank') || !!p.isCommunity;
      }

      const searchMatch =
        !drawerSearchQuery.trim() ||
        p.title.toLowerCase().includes(drawerSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(drawerSearchQuery.toLowerCase());

      return sheetMatch && searchMatch;
    });
  }, [allProblems, drawerSheet, drawerSearchQuery]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Active problem personal best
  const activePB = activeProblem ? personalBests[activeProblem.id] : null;

  // Pace indicator compared to PB
  const paceDiff = activePB ? elapsedSeconds - activePB.bestTimeSeconds : 0;
  const isAheadOfPace = activePB ? paceDiff < 0 : true;

  // Syntax highlighting scroll sync
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Tab key indent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      const next = val.substring(0, start) + '  ' + val.substring(end);
      setCode(next);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      }, 0);
    }
  };

  // 1. RUN ACTION: Executes against sample input
  const handleRun = async () => {
    if (!activeProblem) return;
    const problemId = activeProblem.id;
    sound.playClick();
    if (mobileTab === 'problem') {
      setMobileTab('code');
    }
    setIsRunning(true);
    setRunResult(null);
    setActiveConsoleTab('output');

    try {
      const sampleInput = customStdin || activeProblem.sampleCases[0]?.input || '';
      const result = await executeCodeSandbox(code, selectedLanguage, sampleInput);
      if (!isComponentMountedRef.current || activeProblemRef.current?.id !== problemId) return;
      setRunResult(result);
      if (result.hasError) {
        sound.playError();
      } else {
        sound.playClick();
      }
    } catch (runErr) {
      if (!isComponentMountedRef.current || activeProblemRef.current?.id !== problemId) return;
      sound.playError();
      const errMsg = normalizeError(runErr);
      setRunResult({
        stdout: '',
        stderr: errMsg,
        executionTimeMs: 0,
        hasError: true,
        errorMessage: errMsg,
        errorCategory: 'runtime'
      });
    } finally {
      if (isComponentMountedRef.current && activeProblemRef.current?.id === problemId) {
        setIsRunning(false);
      }
    }
  };

  // 2. TEST ACTION: Evaluates against visible sample cases
  const handleTest = async () => {
    if (!activeProblem) return;
    const problemId = activeProblem.id;
    sound.playClick();
    if (mobileTab === 'problem') {
      setMobileTab('code');
    }
    setIsTesting(true);
    setEvaluationResult(null);
    setActiveConsoleTab('tests');

    try {
      const sampleCases = activeProblem.sampleCases || [];
      const summary = await evaluateTestCases(code, selectedLanguage, sampleCases);
      if (!isComponentMountedRef.current || activeProblemRef.current?.id !== problemId) return;
      setEvaluationResult(summary);
      if (summary.allPassed) {
        sound.playSuccess();
      } else {
        sound.playError();
      }
    } catch (err) {
      if (!isComponentMountedRef.current || activeProblemRef.current?.id !== problemId) return;
      sound.playError();
      setEvaluationResult({
        verdict: 'Runtime Error',
        allPassed: false,
        passedCount: 0,
        totalCount: activeProblem.sampleCases?.length || 0,
        results: [],
        totalTimeMs: 0,
        errorMessage: normalizeError(err)
      });
    } finally {
      if (isComponentMountedRef.current && activeProblemRef.current?.id === problemId) {
        setIsTesting(false);
      }
    }
  };

  // 3. SUBMIT ACTION: Evaluates against ALL test cases (visible + hidden)
  const handleSubmit = async () => {
    if (!activeProblem || isSubmittingRef.current || hasRecordedResultRef.current) return;
    const problemId = activeProblem.id;
    sound.playClick();
    if (mobileTab === 'problem') {
      setMobileTab('code');
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setActiveConsoleTab('tests');

    try {
      const allCases = [...(activeProblem.sampleCases || []), ...(activeProblem.hiddenCases || [])];
      if (allCases.length === 0) {
        throw new Error('Problem has no test cases configured.');
      }

      const summary = await evaluateTestCases(code, selectedLanguage, allCases);
      if (!isComponentMountedRef.current || activeProblemRef.current?.id !== problemId) {
        // Discard stale result if component unmounted or user switched problem while execution was running
        return;
      }

      setEvaluationResult(summary);

      if (summary.allPassed) {
        pauseTimer();
        hasRecordedResultRef.current = true;
        const finalTime = Math.max(1, getElapsedSeconds());

        try {
          const recordRes = recordProblemTime(problemId, finalTime, selectedLanguage);
          if (!isComponentMountedRef.current || activeProblemRef.current?.id !== problemId) return;

          setSolveRecordResult(recordRes);

          // Update local personal bests state & notify parent
          setPersonalBests(getAllPersonalBests());
          const updatedStats = getTrainingStats();
          setTrainingStats(updatedStats);
          onStatsUpdated?.();

          sound.playSuccess();
          fireSuccessConfetti();

          if (recordRes.isNewBest) {
            addXp(50); // +30 completion + 20 PB bonus
          } else {
            addXp(25);
          }

          setView('victory');
        } catch (storageErr) {
          console.error('Failed to record personal best:', storageErr);
          sound.playError();
          hasRecordedResultRef.current = false;
          setEvaluationResult({
            ...summary,
            errorMessage: `Failed to save Personal Best: ${normalizeError(storageErr)}`
          });
        }
      } else {
        sound.playError();
      }
    } catch (err) {
      if (!isComponentMountedRef.current || activeProblemRef.current?.id !== problemId) return;
      sound.playError();
      setEvaluationResult({
        verdict: 'Runtime Error',
        allPassed: false,
        passedCount: 0,
        totalCount: (activeProblem.sampleCases?.length || 0) + (activeProblem.hiddenCases?.length || 0),
        results: [],
        totalTimeMs: 0,
        errorMessage: normalizeError(err)
      });
    } finally {
      if (isComponentMountedRef.current && activeProblemRef.current?.id === problemId) {
        setIsSubmitting(false);
      }
      isSubmittingRef.current = false;
    }
  };

  // Language selection with starter template preservation
  const handleSelectLanguage = (newLang: CodeLanguage) => {
    sound.playClick();
    const prevLang = selectedLanguage;
    setSelectedLanguage(newLang);
    if (!activeProblem) return;

    const prevTemplate =
      activeProblem.starterTemplates?.[prevLang] ||
      getDefaultStarterTemplate(prevLang);
    const newTemplate =
      activeProblem.starterTemplates?.[newLang] ||
      getDefaultStarterTemplate(newLang);

    if (!code.trim() || code.trim() === prevTemplate.trim()) {
      setCode(newTemplate);
    }
  };

  // Next problem in active filtered sheet
  const handleNextProblem = () => {
    if (!activeProblem) return;
    const currentIdx = filteredProblems.findIndex(p => p.id === activeProblem.id);
    const next = filteredProblems[currentIdx + 1] || filteredProblems[0];
    if (next) {
      startTrainingOnProblem(next);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-left">
      {/* ----------------- SCREEN 1: CATALOG & ROADMAP EXPLORER ----------------- */}
      {view === 'catalog' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3.5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {onBackToHub && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onBackToHub();
                  }}
                  className="py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-black shrink-0"
                  title="Return to Speed Training Hub overview"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Hub</span>
                </button>
              )}

              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-lg sm:text-2xl shrink-0">
                ⚡
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 truncate">
                    Timed Training &amp; PBs
                  </h2>
                  <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
                    GHOST TIME-TRIAL
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Compete against your own lowest solve time across roadmaps
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              {onOpenArena && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenArena();
                    onCloseHub?.();
                  }}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 border border-purple-500/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Arena Duels</span>
                </button>
              )}
              {onCloseHub && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onCloseHub();
                  }}
                  className="p-1.5 sm:p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Overall Training Stats Banner */}
          <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar text-xs font-bold shrink-0">
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Target className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">Solved: <strong className="text-amber-500 font-black">{trainingStats.totalSolved}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="whitespace-nowrap">PBs Beaten: <strong className="text-emerald-500 font-black">{trainingStats.recordsBeaten}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="whitespace-nowrap">Training Time: <strong className="text-sky-500 font-black">{Math.round(trainingStats.totalTrainingTimeSeconds / 60)}m</strong></span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden md:inline shrink-0">
              Your fastest code runs become your ghost target for future practices!
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Sheet Roadmaps Selector */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Select Training Roadmap Sheet
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'all', title: '⭐ All Problems', desc: 'Full unified problem vault', badge: `${allProblems.length}` },
                  { id: 'neetcode75', title: '🔥 NeetCode 75', desc: 'Must-know technical interview essentials', badge: 'Blind 75' },
                  { id: 'neetcode150', title: '💎 NeetCode 150', desc: 'Comprehensive DSA interview sheet', badge: '150 Sheet' },
                  { id: 'questionbank', title: '📚 Question Bank', desc: 'ByteSized & Community authored', badge: 'Bank' }
                ].map(sheet => {
                  const isSelected = selectedSheet === sheet.id;
                  return (
                    <div
                      key={sheet.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedSheet(sheet.id as ProblemSheet);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                          {sheet.title}
                        </h4>
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-500">
                          {sheet.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {sheet.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search NeetCode & Bank challenges by title or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-primary shrink-0"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Topics' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Problems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProblems.map(prob => {
                const pb = personalBests[prob.id];
                const hasPB = !!pb;

                return (
                  <div
                    key={prob.id}
                    onClick={() => startTrainingOnProblem(prob)}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-amber-500/60 transition-all flex flex-col justify-between gap-3 group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 text-left"
                  >
                    <div>
                      {/* Tags */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            prob.difficulty === 'easy'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : prob.difficulty === 'medium'
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-rose-500/15 text-rose-500'
                          }`}
                        >
                          {prob.difficulty}
                        </span>

                        <div className="flex items-center gap-1">
                          {prob.sheets?.includes('neetcode75') && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              NC 75
                            </span>
                          )}
                          {prob.sheets?.includes('neetcode150') && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              NC 150
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors line-clamp-1">
                        {prob.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {prob.description}
                      </p>
                    </div>

                    {/* Personal Best Gauge / Footer */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      {hasPB ? (
                        <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-black">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>PB: {formatTime(pb.bestTimeSeconds)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({pb.attemptsCount} {pb.attemptsCount === 1 ? 'try' : 'tries'})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                          <Timer className="w-3.5 h-3.5" />
                          <span>No PB set</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs font-black text-amber-500 group-hover:translate-x-0.5 transition-transform">
                        <span>Train</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProblems.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <p className="text-sm font-bold">No training problems match your filter selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SCREEN 2: LIVE SPEED TRAINING (SELF-DUEL) ----------------- */}
      {view === 'training' && activeProblem && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Training HUD Bar */}
          <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19] flex flex-col md:flex-row md:items-center md:justify-between gap-2 shrink-0">
            {/* Row 1: Problem Title, Navigation & Window Actions */}
            <div className="flex items-center justify-between gap-2 w-full md:w-auto min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                {onBackToHub && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      pauseTimer();
                      onBackToHub();
                    }}
                    className="px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    title="Pause timer and return to Hub overview"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Hub</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsProblemDrawerOpen(true);
                  }}
                  className="px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  title="Browse problem list"
                >
                  <List className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden xs:inline">Problems</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    pauseTimer();
                    setView('catalog');
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer items-center gap-1 shrink-0 hidden sm:flex"
                  title="View all training problems"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Roadmap</span>
                </button>

                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-none">
                    {activeProblem.title}
                  </h3>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase shrink-0 ${
                      activeProblem.difficulty === 'easy'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : activeProblem.difficulty === 'medium'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-rose-500/15 text-rose-500'
                    }`}
                  >
                    {activeProblem.difficulty}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    if (activeProblem) {
                      startTrainingOnProblem(activeProblem);
                    }
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                  title="Restart session timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {onCloseHub && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      pauseTimer();
                      onCloseHub();
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Close training"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2 on Mobile, Centered on Desktop: Live Elapsed Stopwatch & Pace vs PB */}
            <div className="flex items-center justify-between md:justify-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs sm:text-sm font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin-slow" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>

              {activePB ? (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-[11px] sm:text-xs font-black truncate ${
                    isAheadOfPace
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Target: {formatTime(activePB.bestTimeSeconds)}</span>
                  <span className="text-[10px] hidden xs:inline shrink-0">
                    ({isAheadOfPace ? `-${formatTime(Math.abs(paceDiff))}` : `+${formatTime(paceDiff)}`})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 text-[11px] font-bold truncate">
                  <span>First attempt • Setting baseline PB</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Segmented Workspace Switcher (< md only) */}
          <div className="flex md:hidden items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2 py-1 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileTab('problem');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'problem'
                  ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Problem</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileTab('code');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'code'
                  ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileTab('tests');
                setActiveConsoleTab('tests');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                mobileTab === 'tests'
                  ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Tests</span>
              {evaluationResult && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    evaluationResult.allPassed ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
              )}
            </button>
          </div>

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Question Statement Panel */}
            <div
              className={`w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden bg-slate-50/60 dark:bg-slate-900/30 ${
                mobileTab === 'problem' ? 'flex flex-1 min-h-0' : 'hidden md:flex'
              }`}
            >
              <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">
                  Topic: {activeProblem.category}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {activeProblem.sheets?.map(s => (
                    <span key={s} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 uppercase">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4 text-left">
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeProblem.description}
                </div>

                {activeProblem.constraints && activeProblem.constraints.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Constraints:
                    </h4>
                    <ul className="list-disc pl-4 text-xs font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                      {activeProblem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sample Cases */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Sample Test Cases:
                  </h4>
                  {activeProblem.sampleCases.map((tc, idx) => (
                    <div
                      key={tc.id || idx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Input:</span>
                          <pre className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap break-all">
                            {tc.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Expected Output:</span>
                          <pre className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap break-all">
                            {tc.output}
                          </pre>
                        </div>
                      </div>
                      {tc.explanation && (
                        <p className="text-[11px] font-sans text-slate-500 font-medium">
                          Explanation: {tc.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progressive Hints (Attempt-First Learning) */}
                {activeProblem.hints && activeProblem.hints.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 fill-amber-500/20" />
                        <span>Hints ({revealedHintsCount}/{activeProblem.hints.length})</span>
                      </h4>
                      {revealedHintsCount < activeProblem.hints.length ? (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setRevealedHintsCount(prev => prev + 1);
                          }}
                          className="text-[10px] font-black uppercase tracking-wider text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Reveal Hint {revealedHintsCount + 1}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">All hints revealed</span>
                      )}
                    </div>

                    {revealedHintsCount > 0 ? (
                      <div className="space-y-2">
                        {activeProblem.hints.slice(0, revealedHintsCount).map((hint, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1"
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">
                              Hint {idx + 1}
                            </span>
                            <p className="leading-relaxed font-sans">{hint}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        Stuck on the algorithm? Reveal progressive hints one by one without spoiling the solution code.
                      </p>
                    )}
                  </div>
                )}

                {/* Explicit Reference Solution Disclosure (Attempt-First Learning) */}
                {activeProblem.solutions && Object.keys(activeProblem.solutions).length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reference Solution</span>
                      </h4>
                      {isSolutionRevealed && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setIsSolutionRevealed(false);
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </button>
                      )}
                    </div>

                    {!isSolutionRevealed ? (
                      !showSolutionConfirm ? (
                        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Reference solutions are hidden by default to prioritize your own problem-solving attempt.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setShowSolutionConfirm(true);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            <span>View Reference Solution</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2.5">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                Reveal Reference Solution?
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                                Attempting to write and test your own code builds deep mastery. If you are stuck, try using progressive hints first!
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setShowSolutionConfirm(false);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-200/80 dark:bg-slate-800/80 cursor-pointer"
                            >
                              Keep Trying
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setIsSolutionRevealed(true);
                                setShowSolutionConfirm(false);
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-sm"
                            >
                              Reveal Solution
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 overflow-x-auto">
                          <div className="flex items-center gap-1">
                            {availableSolutionLangs.map(lang => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setSolutionLanguage(lang);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                                  solutionLanguage === lang
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                {lang === 'cpp' ? 'C++' : lang}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={handleCopySolution}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                              title="Copy solution code"
                            >
                              {copiedSolution ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedSolution ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleLoadSolutionIntoEditor}
                              className="px-2 py-1 rounded-lg text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                              title="Load this reference solution into your editor"
                            >
                              <Code2 className="w-3 h-3" />
                              <span>Load into Editor</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto text-slate-800 dark:text-slate-200 max-h-60 overflow-y-auto">
                          <pre className="whitespace-pre">{currentSolutionCode}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Quick Action to Open Code Editor */}
              <div className="p-2 sm:p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] flex items-center justify-between gap-2 shrink-0 md:hidden pb-[max(0.625rem,env(safe-area-inset-bottom))]">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                  Timer: <strong className="text-amber-500 font-mono">{formatTime(elapsedSeconds)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMobileTab('code');
                  }}
                  className="btn-3d btn-3d-yellow py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-950 cursor-pointer shadow-md"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Open Code Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code Editor Panel */}
            <div
              className={`w-full md:w-7/12 flex flex-col overflow-hidden bg-[#0D1117] text-slate-100 ${
                mobileTab === 'code' || mobileTab === 'tests' ? 'flex flex-1 min-h-0' : 'hidden md:flex'
              }`}
            >
              {/* Language Switcher */}
              <div className="px-3 sm:px-4 py-2 border-b border-slate-800 bg-[#161B22] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
                  <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
                  {(['python', 'javascript', 'cpp', 'c'] as CodeLanguage[]).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        handleSelectLanguage(lang);
                      }}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                        selectedLanguage === lang
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    const template =
                      activeProblem.starterTemplates?.[selectedLanguage] ||
                      getDefaultStarterTemplate(selectedLanguage);
                    setCode(template);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Reset to starter template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Code Area */}
              <div
                className={`relative min-h-[140px] sm:min-h-[160px] overflow-hidden bg-[#0D1117] ${
                  mobileTab === 'tests' ? 'hidden md:flex md:flex-1' : 'flex-1'
                }`}
              >
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  wrap="off"
                  className="absolute inset-0 w-full h-full p-3 sm:p-4 font-mono text-xs sm:text-sm bg-transparent text-slate-100 caret-amber-400 resize-none outline-none z-10 leading-relaxed whitespace-pre overflow-x-auto"
                />
                <pre
                  ref={preRef}
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full p-3 sm:p-4 font-mono text-xs sm:text-sm pointer-events-none overflow-hidden text-transparent select-none leading-relaxed whitespace-pre"
                >
                  <code
                    dangerouslySetInnerHTML={{
                      __html: Prism.highlight(
                        code,
                        selectedLanguage === 'python'
                          ? Prism.languages.python
                          : selectedLanguage === 'cpp'
                          ? Prism.languages.cpp
                          : selectedLanguage === 'c'
                          ? Prism.languages.c
                          : Prism.languages.javascript,
                        selectedLanguage
                      )
                    }}
                  />
                </pre>
              </div>

              {/* Console Drawer */}
              <div
                className={`border-t border-slate-800 bg-[#161B22] flex flex-col ${
                  mobileTab === 'tests' ? 'flex-1 min-h-0' : 'h-40 sm:h-48 shrink-0'
                }`}
              >
                <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 border-b border-slate-800 text-xs shrink-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveConsoleTab('output')}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        activeConsoleTab === 'output' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      <span><span className="hidden xs:inline">Terminal </span>Output</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConsoleTab('tests')}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activeConsoleTab === 'tests' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      <span>Test<span className="hidden xs:inline"> Results</span></span>
                      {evaluationResult && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            evaluationResult.allPassed ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConsoleTab('custom_input')}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        activeConsoleTab === 'custom_input' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      <span><span className="hidden xs:inline">Custom </span>Stdin</span>
                    </button>
                  </div>

                  {runResult && (
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                      {runResult.executionTimeMs}ms
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-3 font-mono text-xs">
                  {activeConsoleTab === 'output' && (
                    <div>
                      {isRunning ? (
                        <div className="text-slate-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <span>Executing code sandbox...</span>
                        </div>
                      ) : runResult ? (
                        <div className="space-y-1">
                          {runResult.hasError ? (
                            <div className="text-rose-400 whitespace-pre-wrap break-all">
                              {runResult.errorMessage || runResult.stderr}
                            </div>
                          ) : (
                            <div className="text-emerald-400 whitespace-pre-wrap break-all">
                              {runResult.stdout || '// Program finished with 0 exit code.'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          Press <strong>Run</strong> for sample output or <strong>Submit</strong> to validate your time against your Personal Best!
                        </div>
                      )}
                    </div>
                  )}

                  {activeConsoleTab === 'tests' && (
                    <div>
                      {isTesting || isSubmitting ? (
                        <div className="text-slate-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                          <span>Evaluating test cases...</span>
                        </div>
                      ) : evaluationResult ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 font-black text-xs">
                            {evaluationResult.allPassed ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Accepted — All {evaluationResult.totalCount} Test Cases Passed!
                              </span>
                            ) : evaluationResult.verdict === 'Infrastructure Error' ? (
                              <span className="text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                Infrastructure Error {evaluationResult.totalCount > 0 ? `— Failed ${evaluationResult.totalCount - evaluationResult.passedCount} / ${evaluationResult.totalCount} Cases` : ''}
                              </span>
                            ) : evaluationResult.verdict === 'Time Limit Exceeded' ? (
                              <span className="text-yellow-400 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Time Limit Exceeded {evaluationResult.totalCount > 0 ? `— Failed ${evaluationResult.totalCount - evaluationResult.passedCount} / ${evaluationResult.totalCount} Cases` : ''}
                              </span>
                            ) : evaluationResult.verdict === 'Compilation Error' ? (
                              <span className="text-purple-400 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Compilation Error {evaluationResult.totalCount > 0 ? `— Failed ${evaluationResult.totalCount - evaluationResult.passedCount} / ${evaluationResult.totalCount} Cases` : ''}
                              </span>
                            ) : (
                              <span className="text-rose-400 flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                {evaluationResult.verdict} {evaluationResult.totalCount > 0 ? `— Failed ${evaluationResult.totalCount - evaluationResult.passedCount} / ${evaluationResult.totalCount} Cases` : ''}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">
                              Total: {evaluationResult.totalTimeMs}ms
                            </span>
                          </div>

                          {evaluationResult.errorMessage && (
                            <div className={`p-2.5 rounded-xl border text-xs font-mono whitespace-pre-wrap break-all ${
                              evaluationResult.verdict === 'Infrastructure Error'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            }`}>
                              {evaluationResult.errorMessage}
                            </div>
                          )}

                          <div className="space-y-1.5">
                            {evaluationResult.results.map((res, i) => (
                              <div
                                key={res.testCaseId || i}
                                className={`p-2.5 rounded-xl border ${
                                  res.passed
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <div className="flex items-center gap-1.5">
                                    <span>Case #{i + 1} {res.isHidden ? '(Hidden)' : ''}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({res.executionTimeMs}ms)</span>
                                  </div>
                                  <span>{res.passed ? 'PASSED ✅' : 'FAILED ❌'}</span>
                                </div>

                                {res.errorMessage && (
                                  <div className="mt-1 text-[11px] text-rose-400 font-mono whitespace-pre-wrap break-all">
                                    {res.errorMessage}
                                  </div>
                                )}

                                {!res.isHidden ? (
                                  <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                                    <div>
                                      <span className="text-slate-400 block font-sans font-semibold">Input:</span>
                                      <pre className="text-slate-200 whitespace-pre-wrap break-all p-1 rounded bg-slate-900/60 mt-0.5">{res.input}</pre>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 block font-sans font-semibold">Expected Output:</span>
                                      <pre className="text-emerald-300 whitespace-pre-wrap break-all p-1 rounded bg-slate-900/60 mt-0.5">{res.expectedOutput}</pre>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <span className="text-slate-400 block font-sans font-semibold">Actual Output:</span>
                                      <pre className={`whitespace-pre-wrap break-all p-1 rounded bg-slate-900/60 mt-0.5 ${res.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                                        {res.actualOutput || '// (empty output)'}
                                      </pre>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-1 text-[10px] text-slate-400 italic">
                                    Hidden test case: input and expected output protected.
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500">Press Test or Submit to run tests.</div>
                      )}
                    </div>
                  )}

                  {activeConsoleTab === 'custom_input' && (
                    <textarea
                      value={customStdin}
                      onChange={e => setCustomStdin(e.target.value)}
                      placeholder="Provide custom input to pass to standard input..."
                      className="w-full h-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono resize-none outline-none focus:border-amber-400"
                    />
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="p-2 sm:p-2.5 border-t border-slate-800 bg-[#161B22] flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 sticky bottom-0 z-20 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
                  <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">
                    Timer: <strong className="text-amber-400 font-mono">{formatTime(elapsedSeconds)}</strong>
                  </span>

                  <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={handleRun}
                      disabled={isRunning || isTesting || isSubmitting}
                      className="flex-1 md:flex-initial min-w-0 py-2 sm:py-1.5 px-2 sm:px-3.5 rounded-xl text-xs font-black uppercase bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Run code against sample input"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-emerald-400 shrink-0" />
                      <span>Run</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTest}
                      disabled={isRunning || isTesting || isSubmitting}
                      className="flex-1 md:flex-initial min-w-0 py-2 sm:py-1.5 px-2 sm:px-3.5 rounded-xl text-xs font-black uppercase bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Evaluate visible sample test cases"
                    >
                      <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Test</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isRunning || isTesting || isSubmitting}
                      className="flex-[1.2] md:flex-initial min-w-0 btn-3d btn-3d-yellow py-2 sm:py-1.5 px-2.5 sm:px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer shadow-md text-slate-950 font-extrabold transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Submit solution to validate against all test cases and record Personal Best"
                    >
                      <Send className="w-3.5 h-3.5 shrink-0" />
                      <span>Submit<span className="hidden xs:inline sm:inline"> for Time</span></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SCREEN 3: VICTORY & PERSONAL BEST SUMMARY ----------------- */}
      {view === 'victory' && activeProblem && solveRecordResult && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-pop">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl animate-bounce ${
            solveRecordResult.isNewBest
              ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/30 ring-4 ring-amber-400/40'
              : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
          }`}>
            {solveRecordResult.isNewBest ? '🏆' : '⏱️'}
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 block mb-1">
              {solveRecordResult.isNewBest ? '🔥 NEW PERSONAL BEST!' : 'Session Complete!'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
              {solveRecordResult.isNewBest
                ? `Record Smashed in ${formatTime(solveRecordResult.newBestSeconds)}!`
                : `Solved in ${formatTime(elapsedSeconds)}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {solveRecordResult.isNewBest && solveRecordResult.previousBestSeconds
                ? `Phenomenal speed! You improved upon your previous best (${formatTime(solveRecordResult.previousBestSeconds)}) by ${solveRecordResult.previousBestSeconds - solveRecordResult.newBestSeconds} seconds!`
                : solveRecordResult.isNewBest
                ? 'Baseline Personal Best established! Your record is saved for future training sessions.'
                : `Good run! Your standing Personal Best remains ${formatTime(solveRecordResult.newBestSeconds)}.`}
            </p>
          </div>

          {/* Comparison Stats Card */}
          <div className="w-full max-w-md p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                This Session Time
              </span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                Saved Personal Best
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {formatTime(solveRecordResult.newBestSeconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 w-full max-w-md px-4">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                stopConfetti();
                startTrainingOnProblem(activeProblem);
              }}
              className="btn-3d btn-3d-yellow px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer text-slate-950 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Train Again to Beat Time</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                stopConfetti();
                handleNextProblem();
              }}
              className="btn-3d btn-3d-primary px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Next Problem</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                stopConfetti();
                if (onBackToHub) {
                  onBackToHub();
                } else {
                  setView('catalog');
                }
              }}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer text-center"
            >
              {onBackToHub ? 'Back to Hub' : 'Roadmap'}
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MOBILE / QUICK PROBLEM SELECTOR DRAWER ----------------- */}
      {isProblemDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm h-full bg-white dark:bg-[#0E131F] border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl animate-slideInRight">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  Select Problem
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 font-mono">
                  {filteredDrawerProblems.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsProblemDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close problems drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Sheet Filter */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0 bg-slate-50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={drawerSearchQuery}
                  onChange={e => setDrawerSearchQuery(e.target.value)}
                  placeholder="Search problems..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-primary"
                />
                {drawerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDrawerSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sheet selector pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'neetcode75', label: 'Blind 75' },
                  { id: 'neetcode150', label: 'NC 150' },
                  { id: 'questionbank', label: 'Bank' }
                ].map(sheet => (
                  <button
                    key={sheet.id}
                    type="button"
                    onClick={() => setDrawerSheet(sheet.id as ProblemSheet)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap cursor-pointer transition-colors ${
                      drawerSheet === sheet.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {sheet.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem List */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1.5">
              {filteredDrawerProblems.map(p => {
                const pb = personalBests[p.id];
                const isCurrent = activeProblem?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      startTrainingOnProblem(p);
                      setIsProblemDrawerOpen(false);
                      setMobileTab('problem');
                    }}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase shrink-0 ${
                            p.difficulty === 'easy'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : p.difficulty === 'medium'
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-rose-500/15 text-rose-500'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {p.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {p.category}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      {pb ? (
                        <div className="flex items-center gap-1 text-[11px] font-mono font-black text-amber-500">
                          <Trophy className="w-3 h-3" />
                          <span>{formatTime(pb.bestTimeSeconds)}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">No PB</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredDrawerProblems.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No problems found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
