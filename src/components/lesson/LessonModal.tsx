import React, { useState, useMemo, useEffect } from 'react';
import { LessonNode, Question, TapToFillQuestion, SpotTheBugQuestion, PredictOutputQuestion, ConceptMatchQuestion } from '../../types';
import { COURSES } from '../../data/courses';
import { useGame } from '../../context/GameContext';
import { useTranslation } from '../../data/translations';
import { getLocalizedNode, getLocalizedQuestion } from '../../utils/lessonTranslator';
import { sound } from '../../utils/audio';
import { fireSmallBurst, stopConfetti } from '../../utils/confetti';
import { CatFace, CatMood } from '../common/CatFace';
import { TTSButton } from '../common/TTSButton';
import { X, Heart, Lightbulb, Sparkles, BookOpen, Flame, Zap } from 'lucide-react';
import { TapToFill } from './TapToFill';
import { SpotTheBug } from './SpotTheBug';
import { PredictOutput } from './PredictOutput';
import { ConceptMatch } from './ConceptMatch';
import { FeedbackBanner } from './FeedbackBanner';
import { LessonCompleteModal } from './LessonCompleteModal';
import { OutOfHeartsModal } from './OutOfHeartsModal';
import { CharacterIntroModal } from './CharacterIntroModal';
import { ConceptGuideModal } from './ConceptGuideModal';
import { AiTutorDrawer } from './AiTutorDrawer';

interface Props {
  node: LessonNode;
  onClose: () => void;
  onOpenPractice: () => void;
  onNextLesson?: (nextNode: LessonNode) => void;
}

export const LessonModal: React.FC<Props> = ({
  node,
  onClose,
  onOpenPractice,
  onNextLesson,
}) => {
  const { state, completeNodeLesson, deductHeart, addMistake } = useGame();
  const t = useTranslation(state.language);

  // Localized Node based on current language
  const localizedNode = useMemo(() => getLocalizedNode(node, state.language), [node, state.language]);

  // Find course and next sequential lesson node in curriculum
  const currentCourse = useMemo(() => {
    return (
      Object.values(COURSES).find(c =>
        c.units.some(u => u.nodes.some(n => n.id === node.id))
      ) || COURSES[state.activeCourseId] || COURSES.c
    );
  }, [node.id, state.activeCourseId]);

  const allNodesInCourse = useMemo(
    () => currentCourse.units.flatMap(u => u.nodes),
    [currentCourse]
  );

  const currentNodeIndex = useMemo(
    () => allNodesInCourse.findIndex(n => n.id === node.id),
    [allNodesInCourse, node.id]
  );

  const nextNode = useMemo(
    () =>
      currentNodeIndex !== -1 && currentNodeIndex + 1 < allNodesInCourse.length
        ? allNodesInCourse[currentNodeIndex + 1]
        : null,
    [allNodesInCourse, currentNodeIndex]
  );

  // Concept Guide state: ensure user is TAUGHT first, not just thrown into a quiz!
  const [showIntro, setShowIntro] = useState<boolean>(!!node.teachingIntro);
  const [showConceptGuide, setShowConceptGuide] = useState<boolean>(!node.teachingIntro);
  const [showMentorTip, setShowMentorTip] = useState<boolean>(false);

  // Clean up any active confetti particles when lesson modal unmounts
  useEffect(() => {
    return () => {
      stopConfetti();
    };
  }, []);

  // Dopamine & Companion Mascot states
  const [catMood, setCatMood] = useState<CatMood>('idle');
  const [comboCount, setComboCount] = useState<number>(0);
  const [showRewardParticle, setShowRewardParticle] = useState<boolean>(false);

  // Adaptive Question Queue
  const [questionQueue, setQuestionQueue] = useState<Question[]>([...node.questions]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  // Tracking unique completions for progress bar
  const totalUniqueQuestions = node.questions.length;
  const [completedUniqueIds, setCompletedUniqueIds] = useState<Set<string>>(new Set());
  const [firstAttemptMistakes, setFirstAttemptMistakes] = useState<Set<string>>(new Set());

  // Input states for different question types
  const [tapAnswers, setTapAnswers] = useState<Record<string, string>>({});
  const [activeBlankId, setActiveBlankId] = useState<string>('blank1');

  const [selectedBugLine, setSelectedBugLine] = useState<number | null>(null);
  const [selectedOutputOption, setSelectedOutputOption] = useState<string | null>(null);
  const [isConceptAllMatched, setIsConceptAllMatched] = useState<boolean>(false);

  // Evaluation & Feedback State
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] = useState<boolean>(false);
  const [currentExplanation, setCurrentExplanation] = useState<string>('');
  const [earnedXpTotal, setEarnedXpTotal] = useState<number>(0);

  // Modal States
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showOutOfHearts, setShowOutOfHearts] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [autoExplainMistake, setAutoExplainMistake] = useState<boolean>(false);

  const rawQuestion = questionQueue[currentQueueIndex];
  const currentQuestion = useMemo(() => {
    if (!rawQuestion) return rawQuestion;
    return getLocalizedQuestion(rawQuestion, state.language);
  }, [rawQuestion, state.language]);

  // Determine if user has made an active input to enable the "Check" button
  const canCheckAnswer = (): boolean => {
    if (!currentQuestion || isAnswerSubmitted) return false;

    switch (currentQuestion.type) {
      case 'tap-to-fill': {
        const q = currentQuestion as TapToFillQuestion;
        return q.blanks.every(b => !!tapAnswers[b.id]);
      }
      case 'spot-the-bug':
        return selectedBugLine !== null;
      case 'predict-output':
        return selectedOutputOption !== null;
      case 'concept-match':
        return isConceptAllMatched;
      default:
        return false;
    }
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || isAnswerSubmitted) return;

    let correct = false;
    let explanation = currentQuestion.explanation;

    switch (currentQuestion.type) {
      case 'tap-to-fill': {
        const q = currentQuestion as TapToFillQuestion;
        correct = q.blanks.every(b => tapAnswers[b.id] === b.correctValue);
        break;
      }
      case 'spot-the-bug': {
        const q = currentQuestion as SpotTheBugQuestion;
        correct = selectedBugLine === q.bugLineIndex;
        if (!correct) {
          explanation = q.bugExplanation || q.explanation;
        }
        break;
      }
      case 'predict-output': {
        const q = currentQuestion as PredictOutputQuestion;
        const selectedOpt = q.options.find(o => o.id === selectedOutputOption);
        correct = !!selectedOpt?.isCorrect;
        break;
      }
      case 'concept-match': {
        correct = isConceptAllMatched;
        break;
      }
    }

    setIsCurrentAnswerCorrect(correct);
    setCurrentExplanation(explanation);
    setIsAnswerSubmitted(true);

    if (correct) {
      sound.playSuccess();
      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);
      sound.playCombo(nextCombo);
      setCatMood('cheering');
      setShowRewardParticle(true);

      // Dopamine confetti on combo milestones
      if (nextCombo >= 2) {
        fireSmallBurst();
      }

      setEarnedXpTotal(prev => prev + currentQuestion.xpReward);
      setCompletedUniqueIds(prev => new Set(prev).add(currentQuestion.id));
    } else {
      sound.playError();
      setComboCount(0);
      setCatMood('comforting');
      const stillAlive = deductHeart();
      addMistake(currentQuestion);

      setFirstAttemptMistakes(prev => new Set(prev).add(currentQuestion.id));

      // Adaptive Mistake Loop: Append question to end of queue so user masters it!
      setQuestionQueue(prev => [...prev, currentQuestion]);

      if (!stillAlive) {
        setShowOutOfHearts(true);
      }
    }
  };

  const handleContinueAfterFeedback = () => {
    setIsAnswerSubmitted(false);
    setShowRewardParticle(false);
    setCatMood('idle');

    // Reset input states for next question
    setTapAnswers({});
    setActiveBlankId('blank1');
    setSelectedBugLine(null);
    setSelectedOutputOption(null);
    setIsConceptAllMatched(false);

    const nextIndex = currentQueueIndex + 1;
    if (nextIndex < questionQueue.length) {
      setCurrentQueueIndex(nextIndex);
    } else {
      // Completed all questions in the queue!
      const totalFirstAttempts = totalUniqueQuestions;
      const mistakesCount = firstAttemptMistakes.size;
      const accuracy = Math.round(
        Math.max(0, ((totalFirstAttempts - mistakesCount) / totalFirstAttempts) * 100)
      );

      completeNodeLesson(node.id, earnedXpTotal, 15, accuracy);
      setIsFinished(true);
    }
  };

  // Progress Bar Percentage
  const progressPercent = Math.min(
    100,
    Math.round((completedUniqueIds.size / totalUniqueQuestions) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#0B0F19] flex flex-col justify-between overflow-y-auto w-full max-w-full overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4 max-w-full overflow-hidden">
        {/* Exit Button */}
        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          title="Exit lesson"
        >
          <X className="w-5 sm:w-6 h-5 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Animated Progress Bar */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-4">
          <div className="w-full h-3.5 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 relative shadow-inner">
            <div
              className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${Math.max(6, progressPercent)}%` }}
            >
              {/* Highlight shine sweep */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/35 rounded-t-full" />
            </div>
          </div>
        </div>

        {/* Combo Streak & Mascot Companion */}
        <div className="flex items-center gap-2 shrink-0">
          {comboCount >= 2 && (
            <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 text-brand-orange text-xs font-black animate-pop border border-orange-500/30">
              <Flame className="w-3.5 h-3.5 fill-current animate-wiggle" />
              <span>{comboCount} IN A ROW!</span>
            </div>
          )}

          {/* Byte Mascot Interactive Head */}
          <button
            type="button"
            onClick={() => {
              sound.playMeow();
              setCatMood('happy');
              setTimeout(() => setCatMood('idle'), 1500);
            }}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Click Byte for encouragement!"
          >
            <CatFace mood={catMood} size="sm" />
          </button>

          {/* Hearts Indicator */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-brand-rose font-black text-xs sm:text-sm">
            <Heart className="w-4 sm:w-5 h-4 sm:h-5 fill-brand-rose stroke-brand-rose animate-pulse" />
            <span>{state.hearts}</span>
          </div>
        </div>
      </header>

      {/* Character Teaching Intro Modal (for lessons with custom dialogue) */}
      {showIntro && (localizedNode.teachingIntro || node.teachingIntro) && (
        <CharacterIntroModal
          intro={localizedNode.teachingIntro || node.teachingIntro!}
          onFinishIntro={() => setShowIntro(false)}
          onSkipIntro={() => setShowIntro(false)}
        />
      )}

      {/* Universal Concept Guide Modal (Teaches the concept first before any quiz!) */}
      {showConceptGuide && (
        <ConceptGuideModal
          node={localizedNode}
          onStartPractice={() => setShowConceptGuide(false)}
        />
      )}

      {/* Main Question Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-3.5 sm:p-6 md:p-8 flex flex-col justify-center items-center pb-32 relative">
        {/* Floating Dopamine XP Burst */}
        {showRewardParticle && (
          <div className="absolute top-2 z-30 pointer-events-none animate-float-reward flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-primary text-white font-black text-sm sm:text-base shadow-xl">
            <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            <span>+{currentQuestion?.xpReward || 15} XP!</span>
            {comboCount >= 2 && <span className="text-amber-200 text-xs">({comboCount}x Streak!)</span>}
          </div>
        )}

        {/* Mentor Bar: Ask Bhai / Review Concept Guide */}
        {currentQuestion && (
          <div className="w-full flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowMentorTip(!showMentorTip);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-amber-500/20"
              >
                <Lightbulb className="w-3.5 h-3.5 fill-current" />
                <span>{showMentorTip ? t.hideHint : t.bhaiHint}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowConceptGuide(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-brand-primary/20"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.conceptGuide}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAutoExplainMistake(false);
                  setIsAiDrawerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-purple-500/20"
                title="Ask ByteBot for guidance"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{state.language === 'bn' ? 'বাইটবটকে জিজ্ঞাসা করুন' : 'Ask ByteBot 🤖'}</span>
              </button>

              {/* TTS Listen Button for Current Question */}
              <TTSButton
                text={`${currentQuestion.prompt}. ${currentQuestion.explanation}`}
                size="sm"
              />
            </div>

            {(localizedNode.teachingIntro || node.teachingIntro) && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowIntro(true);
                }}
                className="text-xs font-extrabold text-brand-accent hover:underline cursor-pointer"
              >
                {t.reviewIntro}
              </button>
            )}
          </div>
        )}

        {/* Floating Mentor Tip Speech Bubble */}
        {showMentorTip && currentQuestion && (
          <div className="w-full p-4 mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 flex items-start gap-3.5 text-left animate-pop shadow-md">
            <CatFace mood="thinking" size="sm" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 block">
                  {t.bhaiMentalModel}
                </span>
                <TTSButton
                  text={currentQuestion.mentorTip || currentQuestion.explanation}
                  size="sm"
                />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentQuestion.mentorTip || currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        {currentQuestion && (
          <div className="w-full animate-pop">
            {currentQuestion.type === 'tap-to-fill' && (
              <TapToFill
                question={currentQuestion as TapToFillQuestion}
                userAnswers={tapAnswers}
                onSelectAnswer={(blankId, val) =>
                  setTapAnswers(prev => ({ ...prev, [blankId]: val }))
                }
                onClearBlank={blankId =>
                  setTapAnswers(prev => {
                    const copy = { ...prev };
                    delete copy[blankId];
                    return copy;
                  })
                }
                activeBlankId={activeBlankId}
                setActiveBlankId={setActiveBlankId}
                isAnswerSubmitted={isAnswerSubmitted}
                isCorrect={isCurrentAnswerCorrect}
              />
            )}

            {currentQuestion.type === 'spot-the-bug' && (
              <SpotTheBug
                question={currentQuestion as SpotTheBugQuestion}
                selectedLineIndex={selectedBugLine}
                onSelectLine={setSelectedBugLine}
                isAnswerSubmitted={isAnswerSubmitted}
                isCorrect={isCurrentAnswerCorrect}
              />
            )}

            {currentQuestion.type === 'predict-output' && (
              <PredictOutput
                question={currentQuestion as PredictOutputQuestion}
                selectedOptionId={selectedOutputOption}
                onSelectOption={setSelectedOutputOption}
                isAnswerSubmitted={isAnswerSubmitted}
                isCorrect={isCurrentAnswerCorrect}
              />
            )}

            {currentQuestion.type === 'concept-match' && (
              <ConceptMatch
                question={currentQuestion as ConceptMatchQuestion}
                onAllMatched={() => setIsConceptAllMatched(true)}
                isAnswerSubmitted={isAnswerSubmitted}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Footer (when feedback banner is not yet shown) */}
      {!isAnswerSubmitted && (
        <footer className="sticky bottom-0 left-0 right-0 p-3 sm:p-4 md:py-5 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs font-semibold text-slate-400 hidden sm:flex items-center gap-2">
              <CatFace mood={catMood} size="xs" />
              <span>
                {currentQuestion?.type === 'concept-match'
                  ? t.matchAllPairs
                  : t.selectYourAnswer}
              </span>
            </div>

            <button
              type="button"
              disabled={!canCheckAnswer()}
              onClick={handleCheckAnswer}
              className={`btn-3d w-full sm:w-auto min-w-[140px] sm:min-w-[160px] py-3.5 px-6 sm:px-8 rounded-2xl text-base font-black uppercase tracking-wider cursor-pointer ${
                canCheckAnswer()
                  ? 'btn-3d-primary shadow-lg'
                  : 'bg-slate-200 text-slate-400 border-b-4 border-slate-300 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-900 cursor-not-allowed'
              }`}
            >
              {t.checkAnswer}
            </button>
          </div>
        </footer>
      )}

      {/* Slide-up Feedback Banner */}
      {isAnswerSubmitted && (
        <FeedbackBanner
          isCorrect={isCurrentAnswerCorrect}
          explanation={currentExplanation}
          xpEarned={currentQuestion.xpReward}
          onContinue={handleContinueAfterFeedback}
          onExplainMistake={() => {
            setAutoExplainMistake(true);
            setIsAiDrawerOpen(true);
          }}
        />
      )}

      {/* Lesson Complete Screen */}
      {isFinished && (
        <LessonCompleteModal
          totalXp={earnedXpTotal}
          accuracy={Math.round(
            Math.max(
              0,
              ((totalUniqueQuestions - firstAttemptMistakes.size) /
                totalUniqueQuestions) *
                100
            )
          )}
          streak={state.streak}
          hasNextLesson={!!nextNode}
          nextLessonTitle={nextNode?.title}
          onNextLesson={() => {
            stopConfetti();
            if (nextNode && onNextLesson) {
              onNextLesson(nextNode);
            } else {
              onClose();
            }
          }}
          onFinish={() => {
            stopConfetti();
            onClose();
          }}
        />
      )}

      {/* Out of Hearts Modal */}
      {showOutOfHearts && (
        <OutOfHeartsModal
          onClose={() => {
            setShowOutOfHearts(false);
            onClose();
          }}
          onStartPractice={() => {
            setShowOutOfHearts(false);
            onClose();
            onOpenPractice();
          }}
        />
      )}

      {/* Quit Lesson Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="p-2 rounded-full bg-amber-500/10 text-brand-gold flex items-center justify-center">
              <CatFace mood="thinking" size="md" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {t.quitLesson}
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {t.quitLessonDesc}
            </p>
            <div className="w-full flex flex-col gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="btn-3d btn-3d-primary w-full py-3 rounded-2xl text-sm font-black uppercase cursor-pointer"
              >
                {t.keepLearning}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
                className="btn-3d btn-3d-gray w-full py-3 rounded-2xl text-sm font-black uppercase text-rose-500 cursor-pointer"
              >
                {t.quitAnyway}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Socratic AI Tutor Drawer */}
      {currentQuestion && (
        <AiTutorDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          courseId={currentCourse.id}
          language={state.language}
          question={currentQuestion}
          tapAnswers={tapAnswers}
          selectedBugLine={selectedBugLine}
          selectedOutputOption={selectedOutputOption}
          isConceptAllMatched={isConceptAllMatched}
          autoTriggerExplain={autoExplainMistake}
        />
      )}
    </div>
  );
};
