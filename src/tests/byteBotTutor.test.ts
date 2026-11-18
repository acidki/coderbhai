import { describe, it, expect } from 'vitest';
import { extractCodeContext, extractUserAnswer } from '../utils/tutorContext';
import {
  TapToFillQuestion,
  SpotTheBugQuestion,
  PredictOutputQuestion,
  ConceptMatchQuestion,
} from '../types';
import { config, POST } from '../../api/tutor';

describe('ByteBot AI Mentor: Context Extraction & Socratic Tutor', () => {
  it('extracts codeContext accurately from tap-to-fill question', () => {
    const q: TapToFillQuestion = {
      id: 'c-intro-1',
      type: 'tap-to-fill',
      prompt: 'Complete the printf statement',
      codeTemplate: '#include <stdio.h>\nint main() {\n  printf("Hello, {blank1}!");\n}',
      options: ['World', 'Code'],
      blanks: [{ id: 'blank1', correctValue: 'World' }],
      explanation: 'printf writes formatted output to stdout.',
      xpReward: 15,
    };

    const code = extractCodeContext(q);
    expect(code).toBe(q.codeTemplate);

    const userAns = extractUserAnswer(q, { blank1: 'Code' });
    expect(userAns).toBe('blank1: "Code"');
  });

  it('extracts codeContext with 1-based line numbers from spot-the-bug question', () => {
    const q: SpotTheBugQuestion = {
      id: 'c-bug-1',
      type: 'spot-the-bug',
      prompt: 'Find the syntax error',
      codeLines: [
        '#include <stdio.h>',
        'int main() {',
        '    int x = 10',
        '    return 0;',
        '}',
      ],
      bugLineIndex: 2,
      bugExplanation: 'Missing semicolon on line 3',
      explanation: 'Every C statement must end with a semicolon',
      xpReward: 20,
    };

    const code = extractCodeContext(q);
    expect(code).toContain('1: #include <stdio.h>');
    expect(code).toContain('3:     int x = 10');

    const userAns = extractUserAnswer(q, undefined, 2);
    expect(userAns).toContain('Selected line 3');
    expect(userAns).toContain('int x = 10');
  });

  it('extracts codeSnippet and option text from predict-output question', () => {
    const q: PredictOutputQuestion = {
      id: 'c-output-1',
      type: 'predict-output',
      prompt: 'What does this program print?',
      codeSnippet: 'int a = 5;\nprintf("%d", a * 2);',
      options: [
        { id: 'opt1', text: '5', isCorrect: false },
        { id: 'opt2', text: '10', isCorrect: true },
      ],
      explanation: '5 * 2 = 10',
      xpReward: 15,
    };

    const code = extractCodeContext(q);
    expect(code).toBe(q.codeSnippet);

    const userAns = extractUserAnswer(q, undefined, null, 'opt1');
    expect(userAns).toBe('Selected option: "5"');
  });

  it('extracts pairs from concept-match question', () => {
    const q: ConceptMatchQuestion = {
      id: 'c-match-1',
      type: 'concept-match',
      prompt: 'Match terms to definitions',
      pairs: [
        { id: 'p1', term: 'Pointer', definition: 'Stores memory address' },
        { id: 'p2', term: 'Array', definition: 'Contiguous memory block' },
      ],
      explanation: 'Pointers store addresses while arrays store elements contiguously.',
      xpReward: 25,
    };

    const code = extractCodeContext(q);
    expect(code).toContain('Pointer -> Stores memory address');
    expect(code).toContain('Array -> Contiguous memory block');

    const matchedAns = extractUserAnswer(q, undefined, null, null, true);
    expect(matchedAns).toBe('All concepts matched');

    const unmatchedAns = extractUserAnswer(q, undefined, null, null, false);
    expect(unmatchedAns).toBe('Incomplete / incorrect concept matches');
  });

  it('verifies api/tutor exports edge runtime configuration', () => {
    expect(config).toBeDefined();
    expect(config.runtime).toBe('edge');
  });

  it('verifies api/tutor returns 503 error when neither API key is configured', async () => {
    const origGroq = process.env.GROQ_API_KEY;
    const origGoogle = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    try {
      const fakeReq = new Request('http://localhost:3000/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'hint please' }] }],
          tutorContext: {
            mode: 'mistake',
            contextId: 'test-1',
            courseId: 'c',
            language: 'en',
            questionType: 'tap-to-fill',
          },
        }),
      });

      const res = await POST(fakeReq);
      expect(res.status).toBe(503);

      const json = await res.json();
      expect(json.error).toContain('Neither GROQ_API_KEY nor GOOGLE_GENERATIVE_AI_API_KEY');
    } finally {
      if (origGroq !== undefined) process.env.GROQ_API_KEY = origGroq;
      if (origGoogle !== undefined) process.env.GOOGLE_GENERATIVE_AI_API_KEY = origGoogle;
    }
  });

  it('verifies api/tutor handles slide_why mode request validation', async () => {
    const origGroq = process.env.GROQ_API_KEY;
    const origGoogle = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    try {
      const fakeReq = new Request('http://localhost:3000/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'why does this work?' }] }],
          tutorContext: {
            mode: 'slide_why',
            contextId: 'slide-0-pointers',
            courseId: 'c',
            language: 'en',
            slideTitle: 'Pointers 101',
            speech: 'Pointers hold memory addresses.',
          },
        }),
      });

      const res = await POST(fakeReq);
      expect(res.status).toBe(503);
    } finally {
      if (origGroq !== undefined) process.env.GROQ_API_KEY = origGroq;
      if (origGoogle !== undefined) process.env.GOOGLE_GENERATIVE_AI_API_KEY = origGoogle;
    }
  });

  it('verifies api/tutor handles code_error mode request validation', async () => {
    const origGroq = process.env.GROQ_API_KEY;
    const origGoogle = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    try {
      const fakeReq = new Request('http://localhost:3000/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'what does this error mean?' }] }],
          tutorContext: {
            mode: 'code_error',
            contextId: 'code-err-123',
            courseId: 'c',
            language: 'bn',
            code: 'int main() { printf("hi"); }',
            stderr: 'error: implicit declaration of function printf',
          },
        }),
      });

      const res = await POST(fakeReq);
      expect(res.status).toBe(503);
    } finally {
      if (origGroq !== undefined) process.env.GROQ_API_KEY = origGroq;
      if (origGoogle !== undefined) process.env.GOOGLE_GENERATIVE_AI_API_KEY = origGoogle;
    }
  });
});
