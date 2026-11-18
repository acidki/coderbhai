import {
  Question,
  TapToFillQuestion,
  SpotTheBugQuestion,
  PredictOutputQuestion,
  ConceptMatchQuestion,
} from '../types';

export type TutorMode = 'mistake' | 'slide_why' | 'code_error';

export interface TutorContext {
  mode: TutorMode;
  contextId: string;
  courseId?: string;
  language?: 'en' | 'bn';
  // mistake mode
  questionType?: string;
  prompt?: string;
  codeContext?: string;
  userAnswer?: string;
  mentorTip?: string;
  // slide_why mode
  slideTitle?: string;
  speech?: string;
  codeSnippet?: string;
  anatomy?: Array<{ token: string; explanation: string }>;
  // code_error mode
  code?: string;
  stderr?: string;
}

export function extractCodeContext(question: Question): string {
  switch (question.type) {
    case 'tap-to-fill': {
      const q = question as TapToFillQuestion;
      return q.codeTemplate || '';
    }
    case 'spot-the-bug': {
      const q = question as SpotTheBugQuestion;
      return (q.codeLines || []).map((line, idx) => `${idx + 1}: ${line}`).join('\n');
    }
    case 'predict-output': {
      const q = question as PredictOutputQuestion;
      return q.codeSnippet || '';
    }
    case 'concept-match': {
      const q = question as ConceptMatchQuestion;
      return (q.pairs || []).map(p => `${p.term} -> ${p.definition}`).join('\n');
    }
    default:
      return '';
  }
}

export function extractUserAnswer(
  question: Question,
  tapAnswers?: Record<string, string>,
  selectedBugLine?: number | null,
  selectedOutputOption?: string | null,
  isConceptAllMatched?: boolean
): string {
  switch (question.type) {
    case 'tap-to-fill': {
      if (!tapAnswers || Object.keys(tapAnswers).length === 0) {
        return 'No blanks filled yet';
      }
      return Object.entries(tapAnswers)
        .map(([blankId, val]) => `${blankId}: "${val}"`)
        .join(', ');
    }
    case 'spot-the-bug': {
      const q = question as SpotTheBugQuestion;
      if (selectedBugLine === null || selectedBugLine === undefined) {
        return 'No bug line selected';
      }
      const line = q.codeLines?.[selectedBugLine] ?? '';
      return `Selected line ${selectedBugLine + 1}: "${line}"`;
    }
    case 'predict-output': {
      const q = question as PredictOutputQuestion;
      if (!selectedOutputOption) {
        return 'No output option selected';
      }
      const opt = q.options?.find(o => o.id === selectedOutputOption);
      return `Selected option: "${opt?.text || selectedOutputOption}"`;
    }
    case 'concept-match': {
      return isConceptAllMatched ? 'All concepts matched' : 'Incomplete / incorrect concept matches';
    }
    default:
      return 'No answer given';
  }
}
