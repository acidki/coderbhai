import React, { useState, useMemo } from 'react';
import { useDsaProgress } from '../../context/DsaProgressContext';
import { DsaRoadmapId, DsaProblemStatus, DsaProblemDifficulty } from '../../types/dsa';
import { DSA_ROADMAPS } from '../../data/dsaRoadmaps';
import { sound } from '../../utils/audio';
import {
  X,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Brain,
  Rocket,
  Filter,
  ChevronDown,
  RotateCcw,
  Terminal,
  ArrowLeft
} from 'lucide-react';
import { DsaProblem } from '../../types/dsa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialRoadmapId?: DsaRoadmapId;
  onOpenInCodeZone?: (problem: DsaProblem, roadmapId: DsaRoadmapId) => void;
  onBackToSpeedTraining?: () => void;
}

export const DsaRoadmapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialRoadmapId = 'blind75',
  onOpenInCodeZone,
  onBackToSpeedTraining,
}) => {
  const { progress, setProblemStatus, getRoadmapProgress } = useDsaProgress();
  const [activeRoadmapId, setActiveRoadmapId] = useState<DsaRoadmapId>(initialRoadmapId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | DsaProblemDifficulty>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DsaProblemStatus>('all');
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const currentRoadmap = DSA_ROADMAPS[activeRoadmapId] || DSA_ROADMAPS.blind75;
  const roadmapSummary = getRoadmapProgress(activeRoadmapId);

  const toggleTopicCollapse = (category: string) => {
    sound.playClick();
    setCollapsedTopics(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter problems based on search, difficulty, and status
  const filteredProblemsByTopic = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const map = new Map<string, typeof currentRoadmap.problems>();

    currentRoadmap.categories.forEach((cat) => {
      map.set(cat, []);
    });

    currentRoadmap.problems.forEach((prob) => {
      // Search filter
      if (query && !prob.title.toLowerCase().includes(query) && !prob.id.toLowerCase().includes(query)) {
        return;
      }
      // Difficulty filter
      if (difficultyFilter !== 'all' && prob.difficulty !== difficultyFilter) {
        return;
      }
      // Status filter
      const currentStatus = progress[prob.id] || 'not-started';
      if (statusFilter !== 'all' && currentStatus !== statusFilter) {
        return;
      }

      if (map.has(prob.category)) {
        map.get(prob.category)!.push(prob);
      }
    });

    return map;
  }, [currentRoadmap, searchQuery, difficultyFilter, statusFilter, progress]);

  if (!isOpen) return null;

  const handleStatusChange = (problemId: string, newStatus: DsaProblemStatus) => {
    if (newStatus === 'solved') {
      sound.playSuccess();
    } else {
      sound.playClick();
    }
    setProblemStatus(problemId, newStatus);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dsa-roadmap-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92vh] flex flex-col bg-white dark:bg-[#0E131F] border-0 sm:border-2 border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                {activeRoadmapId === 'blind75' ? (
                  <Brain className="w-5 h-5" />
                ) : (
                  <Rocket className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2
                  id="dsa-roadmap-modal-title"
                  className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2"
                >
                  <span>{currentRoadmap.title}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/20">
                    {currentRoadmap.totalCount} Problems
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                  {currentRoadmap.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onBackToSpeedTraining && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onBackToSpeedTraining();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Speed Training Hub</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close roadmap modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Roadmap Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveRoadmapId('blind75');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRoadmapId === 'blind75'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🧠 Blind 75</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveRoadmapId('neetcode150');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRoadmapId === 'neetcode150'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🚀 NeetCode 150</span>
            </button>
          </div>

          {/* Overall Roadmap Progress Bar */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-black">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 dark:text-slate-200">
                  {currentRoadmap.title} Progress:
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {roadmapSummary.solved} / {roadmapSummary.total} Solved
                </span>
                {roadmapSummary.attempted > 0 && (
                  <span className="font-mono text-amber-500 font-bold text-[11px]">
                    ({roadmapSummary.attempted} in progress)
                  </span>
                )}
              </div>
              <span className="font-mono font-black text-brand-primary text-sm">
                {roadmapSummary.percentage}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  activeRoadmapId === 'blind75'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                }`}
                style={{ width: `${Math.min(100, roadmapSummary.percentage)}%` }}
              />
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem title or keyword..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-brand-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-400 px-1 hidden sm:inline">
                Difficulty:
              </span>
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setDifficultyFilter(diff);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    difficultyFilter === diff
                      ? diff === 'Easy'
                        ? 'bg-emerald-500 text-white'
                        : diff === 'Medium'
                        ? 'bg-amber-500 text-white'
                        : diff === 'Hard'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {diff === 'all' ? 'All Diff' : diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-400 px-1 hidden sm:inline">
                Status:
              </span>
              {(['all', 'solved', 'attempted', 'not-started'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStatusFilter(st);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    statusFilter === st
                      ? st === 'solved'
                        ? 'bg-emerald-600 text-white'
                        : st === 'attempted'
                        ? 'bg-amber-600 text-white'
                        : st === 'not-started'
                        ? 'bg-slate-600 text-white'
                        : 'bg-brand-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all'
                    ? 'All Status'
                    : st === 'solved'
                    ? 'Solved'
                    : st === 'attempted'
                    ? 'Attempted'
                    : 'Unsolved'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body: Official Topics Accordion */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {currentRoadmap.categories.map((category) => {
            const problems = filteredProblemsByTopic.get(category) || [];
            const topicStat = roadmapSummary.topicSummaries[category] || {
              total: 0,
              solved: 0,
              attempted: 0,
              notStarted: 0,
              percentage: 0,
            };

            // If filters are active and no problems match this category, hide or collapse
            if (problems.length === 0 && (searchQuery || difficultyFilter !== 'all' || statusFilter !== 'all')) {
              return null;
            }

            const isCollapsed = !!collapsedTopics[category];

            return (
              <div
                key={category}
                className="rounded-2xl border-2 border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs"
              >
                {/* Topic Header Accordion Button */}
                <button
                  type="button"
                  onClick={() => toggleTopicCollapse(category)}
                  className="w-full p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-left cursor-pointer gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {category}
                      </h3>
                      <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        ({topicStat.solved} / {topicStat.total} Solved • {topicStat.percentage}%)
                      </span>
                    </div>

                    <div className="w-full sm:max-w-xs h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, topicStat.percentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {problems.length} {problems.length === 1 ? 'problem' : 'problems'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    />
                  </div>
                </button>

                {/* Problems List */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {problems.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No problems match the current search or filters in this topic.
                      </div>
                    ) : (
                      problems.map((prob) => {
                        const status: DsaProblemStatus = progress[prob.id] || 'not-started';

                        return (
                          <div
                            key={prob.id}
                            className={`p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                              status === 'solved'
                                ? 'bg-emerald-500/5 dark:bg-emerald-950/20'
                                : status === 'attempted'
                                ? 'bg-amber-500/5 dark:bg-amber-950/20'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            {/* Left: Position, Title, Difficulty */}
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                {prob.order}
                              </span>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <a
                                    href={prob.leetcodeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs sm:text-sm font-black transition-colors hover:underline flex items-center gap-1.5 ${
                                      status === 'solved'
                                        ? 'text-emerald-700 dark:text-emerald-300'
                                        : 'text-slate-800 dark:text-slate-100'
                                    }`}
                                  >
                                    <span>{prob.title}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                  </a>

                                  {/* Difficulty Pill */}
                                  <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                      prob.difficulty === 'Easy'
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                        : prob.difficulty === 'Medium'
                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                    }`}
                                  >
                                    {prob.difficulty}
                                  </span>

                                  {prob.roadmaps.includes('blind75') && activeRoadmapId === 'neetcode150' && (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-500 dark:text-purple-400 border border-purple-500/20">
                                      Blind 75
                                    </span>
                                  )}
                                </div>

                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {prob.category} • #{prob.topicOrder} in topic
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions (Solve in CodeZone + Status Selector) */}
                            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 flex-wrap">
                              {onOpenInCodeZone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playClick();
                                    onOpenInCodeZone(prob, activeRoadmapId);
                                  }}
                                  className="btn-3d px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                  title={`Solve ${prob.title} in CodeZone`}
                                >
                                  <Terminal className="w-3.5 h-3.5" />
                                  <span>Solve in CodeZone</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleStatusChange(prob.id, 'solved')}
                                aria-label={`Mark ${prob.title} as Solved`}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                  status === 'solved'
                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/50'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-500/15 hover:text-emerald-600'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Solved</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(prob.id, 'attempted')}
                                aria-label={`Mark ${prob.title} as Attempted`}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                  status === 'attempted'
                                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/50'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-500/15 hover:text-amber-600'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Attempted</span>
                              </button>

                              {status !== 'not-started' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(prob.id, 'not-started')}
                                  aria-label={`Reset ${prob.title} to Not Started`}
                                  title="Reset to Not Started"
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
