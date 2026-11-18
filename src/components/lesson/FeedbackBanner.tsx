import React from 'react';
import { CatFace } from '../common/CatFace';
import { TTSButton } from '../common/TTSButton';
import { useGame } from '../../context/GameContext';
import { useTranslation } from '../../data/translations';
import { Zap, HeartCrack, Sparkles } from 'lucide-react';

interface Props {
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
  onContinue: () => void;
  onExplainMistake?: () => void;
}

export const FeedbackBanner: React.FC<Props> = ({
  isCorrect,
  explanation,
  xpEarned,
  onContinue,
  onExplainMistake,
}) => {
  const { state } = useGame();
  const t = useTranslation(state.language);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:py-6 md:px-8 border-t-2 shadow-2xl transition-all duration-300 transform translate-y-0 ${
        isCorrect
          ? 'bg-emerald-50 border-emerald-300 dark:bg-[#071F14] dark:border-emerald-800'
          : 'bg-rose-50 border-rose-300 dark:bg-[#2A0E11] dark:border-rose-900'
      }`}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Feedback Message & Explanation */}
        <div className="flex items-start gap-3.5 text-left w-full sm:w-auto flex-1">
          <div className="shrink-0 mt-0.5">
            {isCorrect ? (
              <div className="p-1 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 shadow-md animate-pop">
                <CatFace mood="cheering" size="sm" />
              </div>
            ) : (
              <div className="p-1 rounded-2xl bg-rose-500/20 border border-rose-500/40 shadow-md animate-wiggle">
                <CatFace mood="comforting" size="sm" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xl sm:text-2xl font-black ${
                  isCorrect
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-brand-rose dark:text-rose-400'
                }`}
              >
                {isCorrect ? t.purrfectCode : t.bhaiCorrection}
              </span>
              <TTSButton text={explanation} size="sm" />
              {isCorrect && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  +{xpEarned} XP
                </span>
              )}
              {!isCorrect && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-rose/20 text-brand-rose dark:bg-rose-500/30">
                  <HeartCrack className="w-3.5 h-3.5" />
                  -1 {t.hearts}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-snug">
              {explanation}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {!isCorrect && onExplainMistake && (
            <button
              type="button"
              onClick={onExplainMistake}
              className="btn-3d w-full sm:w-auto min-w-[150px] py-3.5 px-6 rounded-2xl text-base font-black uppercase tracking-wider cursor-pointer shadow-lg bg-amber-500 hover:bg-amber-400 text-slate-900 border-b-4 border-amber-600 active:translate-y-1 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-900" />
              <span>{state.language === 'bn' ? 'ভুলটি বুঝিয়ে দাও' : 'Explain Mistake'}</span>
            </button>
          )}

          {/* Chunky Continue Button */}
          <button
            type="button"
            onClick={onContinue}
            className={`btn-3d w-full sm:w-auto min-w-[150px] py-3.5 px-8 rounded-2xl text-base font-black uppercase tracking-wider cursor-pointer shadow-lg ${
              isCorrect ? 'btn-3d-primary' : 'btn-3d-rose'
            }`}
          >
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );
};
