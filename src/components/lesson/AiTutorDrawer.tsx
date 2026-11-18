import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Question, CourseId } from '../../types';
import {
  TutorContext,
  TutorMode,
  extractCodeContext,
  extractUserAnswer,
} from '../../utils/tutorContext';
import { CatFace } from '../common/CatFace';
import {
  X,
  Send,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Bot,
  AlertCircle,
  Terminal,
} from 'lucide-react';

export interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tutorContext?: TutorContext;
  autoTriggerPrompt?: string | null;
  onAutoTriggerConsumed?: () => void;

  // Convenience / Backward-compatibility props:
  courseId?: CourseId | string;
  language?: 'en' | 'bn';
  question?: Question;
  tapAnswers?: Record<string, string>;
  selectedBugLine?: number | null;
  selectedOutputOption?: string | null;
  isConceptAllMatched?: boolean;
  autoTriggerExplain?: boolean;
}

const QUICK_PROMPTS_BY_MODE: Record<
  TutorMode,
  Array<{ en: string; bn: string; icon: 'alert' | 'bulb' | 'help' | 'terminal' | 'sparkle' }>
> = {
  mistake: [
    { en: 'Explain my mistake', bn: 'আমার ভুলটা ব্যাখ্যা করো', icon: 'alert' },
    { en: 'Give me a small hint', bn: 'আমাকে একটি ছোট ইঙ্গিত দাও', icon: 'bulb' },
    { en: 'What concept is tested here?', bn: 'এখানে কোন ধারণাটি পরীক্ষা করা হচ্ছে?', icon: 'help' },
  ],
  slide_why: [
    { en: 'Why does this work this way?', bn: 'এটা এভাবে কেন কাজ করে?', icon: 'sparkle' },
    { en: 'Give an intuitive analogy', bn: 'একটি সহজ বাস্তব উদাহরণ দাও', icon: 'bulb' },
    { en: 'What if we skipped this?', bn: 'এটা না করলে কী সমস্যা হতো?', icon: 'help' },
  ],
  code_error: [
    { en: 'What does this error mean?', bn: 'এই এররটির মানে কী?', icon: 'alert' },
    { en: 'Which line should I check?', bn: 'আমার কোন লাইনটি দেখা উচিত?', icon: 'terminal' },
    { en: 'How can I fix this issue?', bn: 'এই সমস্যাটা কীভাবে সমাধান করব?', icon: 'bulb' },
  ],
};

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  isOpen,
  onClose,
  tutorContext: explicitContext,
  autoTriggerPrompt: explicitAutoTrigger,
  onAutoTriggerConsumed,
  courseId = 'c',
  language: explicitLanguage,
  question,
  tapAnswers,
  selectedBugLine,
  selectedOutputOption,
  isConceptAllMatched,
  autoTriggerExplain = false,
}) => {
  // Resolve effective tutorContext
  const effectiveContext: TutorContext = useMemo(() => {
    if (explicitContext) {
      return explicitContext;
    }
    // Fallback: build from quiz question
    return {
      mode: 'mistake',
      contextId: question?.id || 'quiz-default',
      courseId,
      language: explicitLanguage || 'en',
      questionType: question?.type,
      prompt: question?.prompt,
      codeContext: question ? extractCodeContext(question) : '',
      userAnswer: question
        ? extractUserAnswer(
            question,
            tapAnswers,
            selectedBugLine,
            selectedOutputOption,
            isConceptAllMatched
          )
        : '',
      mentorTip: question?.mentorTip || question?.explanation || '',
    };
  }, [
    explicitContext,
    question,
    courseId,
    explicitLanguage,
    tapAnswers,
    selectedBugLine,
    selectedOutputOption,
    isConceptAllMatched,
  ]);

  const lang = effectiveContext.language || 'en';
  const isBengali = lang === 'bn';
  const mode = effectiveContext.mode || 'mistake';

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consumedTriggerRef = useRef<string | null>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/tutor' }),
    []
  );

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport,
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const userMessageCount = useMemo(
    () => messages.filter(m => m.role === 'user').length,
    [messages]
  );
  const hasReachedLimit = userMessageCount >= 3;
  const remainingPrompts = Math.max(0, 3 - userMessageCount);

  // Reset conversation state whenever contextId changes
  useEffect(() => {
    if (effectiveContext.contextId) {
      setMessages([]);
      consumedTriggerRef.current = null;
    }
  }, [effectiveContext.contextId, setMessages]);

  // Scroll smoothly to bottom on message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, status]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading || hasReachedLimit) return;
    setInputText('');
    await sendMessage({ text: trimmed }, { body: { tutorContext: effectiveContext } });
  };

  // Determine auto-trigger prompt
  const resolvedAutoTrigger = useMemo(() => {
    if (explicitAutoTrigger) return explicitAutoTrigger;
    if (autoTriggerExplain) {
      return isBengali
        ? 'আমার বর্তমান উত্তরটি কেন ভুল হলো বুঝিয়ে দাও, কিন্তু সমাধান সরাসরি বলবে না।'
        : 'Explain why my current answer is wrong without giving away the final answer.';
    }
    return null;
  }, [explicitAutoTrigger, autoTriggerExplain, isBengali]);

  // Handle auto-triggering when opened
  useEffect(() => {
    if (
      isOpen &&
      resolvedAutoTrigger &&
      consumedTriggerRef.current !== `${effectiveContext.contextId}-${resolvedAutoTrigger}` &&
      !hasReachedLimit &&
      status === 'ready'
    ) {
      const triggerKey = `${effectiveContext.contextId}-${resolvedAutoTrigger}`;
      consumedTriggerRef.current = triggerKey;
      sendMessage({ text: resolvedAutoTrigger }, { body: { tutorContext: effectiveContext } });
      onAutoTriggerConsumed?.();
    }
  }, [
    isOpen,
    resolvedAutoTrigger,
    effectiveContext,
    hasReachedLimit,
    status,
    sendMessage,
    onAutoTriggerConsumed,
  ]);

  if (!isOpen) return null;

  const modeBadge =
    mode === 'slide_why'
      ? isBengali
        ? 'কনসেপ্ট মেন্টর'
        : 'Concept Mentor'
      : mode === 'code_error'
      ? isBengali
        ? 'কোড ডক্টর'
        : 'Code Doctor'
      : isBengali
      ? 'কুইজ মেন্টর'
      : 'Quiz Mentor';

  const quickChips = QUICK_PROMPTS_BY_MODE[mode] || QUICK_PROMPTS_BY_MODE.mistake;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-pop"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white dark:bg-[#111827] border-t-2 sm:border-2 border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] h-[640px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#0E1526]/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 shadow-sm">
              <CatFace mood={isLoading ? 'thinking' : 'happy'} size="xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>ByteBot</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider">
                    {modeBadge}
                  </span>
                </h3>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {isBengali
                  ? 'সক্রেটিক কোডিং টিউটর • $০ ফ্রি টিয়ার'
                  : 'Socratic Coding Tutor • No spoilers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quota Badge */}
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                remainingPrompts > 1
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : remainingPrompts === 1
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}
            >
              {isBengali
                ? `${remainingPrompts}/৩ টি প্রশ্ন বাকি`
                : `${remainingPrompts}/3 hints left`}
            </span>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 dark:bg-[#0B0F19]/40">
          {/* Welcome Card if no messages */}
          {messages.length === 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 shadow-sm text-left animate-pop">
              <div className="flex items-start gap-3">
                <CatFace mood="cheering" size="sm" />
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isBengali ? 'মিউ! আমি বাইটবট 🐾' : "Meow! I'm ByteBot 🐾"}</span>
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mode === 'slide_why'
                      ? isBengali
                        ? 'এই ধারণাটি কীভাবে কাজ করে এবং কেন এভাবে ডিজাইন করা হয়েছে জানতে চাও? যেকোনো প্রশ্ন করো!'
                        : 'Curious why this programming pattern exists or how it works from first principles? Ask away!'
                      : mode === 'code_error'
                      ? isBengali
                        ? 'কোড চালাতে গিয়ে এরর এসেছে? চিন্তার কিছু নেই! বাগটি কোথায় আর কেন হয়েছে একসাথে খুঁজে বের করি।'
                        : 'Got a compiler or runtime error? No stress! Tap a prompt below or ask me to explain what went wrong.'
                      : isBengali
                      ? 'আমি সরাসরি সঠিক উত্তর বলে দেব না, কিন্তু তোমার চিন্তা সঠিক পথে নিয়ে যেতে সাহায্য করব। নিচের প্রম্পটে চাপ দাও বা নিজে কিছু জিজ্ঞেস করো!'
                      : "I won't spoil the answer, but I'll guide you to understand why your attempt behaves the way it does. Tap a quick chip below or ask away!"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(message => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-2.5 text-left ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="shrink-0 mt-1">
                    <div className="p-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-brand-primary text-white rounded-br-xs font-medium'
                      : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-xs font-normal'
                  }`}
                >
                  {message.parts && message.parts.length > 0 ? (
                    message.parts.map((part, pIdx) => {
                      if (part.type === 'text') {
                        return (
                          <div
                            key={pIdx}
                            className="whitespace-pre-wrap leading-relaxed space-y-1 font-sans"
                          >
                            {part.text}
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <span className="italic opacity-60">
                      {isBengali ? 'উত্তর তৈরি হচ্ছে...' : 'Generating response...'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Streaming Loading Indicator */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
                <CatFace mood="thinking" size="xs" />
              </div>
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <span>
                  {isBengali ? 'বাইটবট ভাবছে...' : 'ByteBot is pondering your code...'}
                </span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {isBengali
                    ? 'বাইটবট বর্তমানে সংযোগ করতে পারছে না।'
                    : 'ByteBot is temporarily unavailable.'}
                </p>
                <p className="mt-0.5 opacity-90 text-[11px]">
                  {isBengali
                    ? 'Vercel এনভায়রনমেন্টে GROQ_API_KEY অথবা GOOGLE_GENERATIVE_AI_API_KEY কনফিগার করা আছে কিনা দেখে নিন।'
                    : 'Please verify GROQ_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is configured in Vercel settings.'}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick-Prompt Chips */}
        <div className="px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#0E1526]/70 shrink-0">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={hasReachedLimit || isLoading}
              onClick={() => handleSendMessage(isBengali ? chip.bn : chip.en)}
              className="shrink-0 text-xs font-bold py-1.5 px-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1.5"
            >
              {chip.icon === 'alert' && <AlertCircle className="w-3 h-3 text-amber-500" />}
              {chip.icon === 'bulb' && <Lightbulb className="w-3 h-3 text-yellow-500" />}
              {chip.icon === 'help' && <HelpCircle className="w-3 h-3 text-cyan-500" />}
              {chip.icon === 'sparkle' && <Sparkles className="w-3 h-3 text-purple-500" />}
              {chip.icon === 'terminal' && <Terminal className="w-3 h-3 text-emerald-500" />}
              <span>{isBengali ? chip.bn : chip.en}</span>
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <footer className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shrink-0">
          {hasReachedLimit ? (
            <div className="text-center py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {isBengali
                ? '🔒 এই প্রসঙ্গের জন্য ৩টি এআই সহায়তার কোটা পূর্ণ হয়েছে।'
                : '🔒 You have used all 3 hints for this context.'}
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder={
                  isBengali
                    ? 'বাইটবটকে প্রশ্ন করুন... (৩টির মধ্যে ১টি)'
                    : 'Ask ByteBot a question...'
                }
                className="flex-1 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2.5 sm:px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-1.5 shadow-md"
                title="Send to ByteBot"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs uppercase tracking-wider">
                  {isBengali ? 'পাঠান' : 'Ask'}
                </span>
              </button>
            </form>
          )}
        </footer>
      </div>
    </div>
  );
};
