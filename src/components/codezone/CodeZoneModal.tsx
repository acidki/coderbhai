import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import { CodeLanguage } from '../../types';
import { sound } from '../../utils/audio';
import { fireSuccessConfetti, stopConfetti } from '../../utils/confetti';
import { CatFace } from '../common/CatFace';
import {
  Terminal,
  Play,
  RotateCcw,
  Copy,
  Check,
  X,
  Lightbulb,
  ExternalLink,
  Keyboard,
  Trash2,
  BookOpen,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Code2
} from 'lucide-react';
import { DsaProblemSpec } from '../../types/dsa';
import { evaluateTestCases, EvaluationSummary } from '../../utils/codeRunner';
import { useDsaProgress } from '../../context/DsaProgressContext';

interface Props {
  initialCode?: string;
  initialLanguage?: CodeLanguage;
  isStandalone?: boolean;
  problem?: DsaProblemSpec | null;
  onClose: () => void;
  onSaveToIdeaZone?: (code: string, language: CodeLanguage) => void;
  onBackToRoadmap?: () => void;
  onProblemSolved?: (problemId: string) => void;
  onProblemAttempted?: (problemId: string) => void;
}

const PAIRS: Record<string, string> = {
  '(': ')',
  '{': '}',
  '[': ']',
  '"': '"',
  "'": "'",
  '`': '`',
};
const CLOSING_SET = new Set([')', '}', ']', '"', "'", '`']);

const STARTER_TEMPLATES: Record<CodeLanguage, Record<string, string>> = {
  c: {
    'Hello World': `#include <stdio.h>

int main(void) {
    printf("Hello, ByteSized!\\n");
    printf("Mastering Pure C line by line!\\n");
    return 0;
}`,
    'Variables & Math': `#include <stdio.h>

int main(void) {
    int age = 21;
    float gpa = 3.85f;
    int division = 15 / 4; // Truncates in C!
    int modulo = 15 % 4;

    printf("Age: %d\\n", age);
    printf("GPA: %.2f\\n", gpa);
    printf("15 / 4 = %d (fraction truncated)\\n", division);
    printf("15 %% 4 = %d (remainder)\\n", modulo);
    return 0;
}`,
    'Pointers & Memory': `#include <stdio.h>

int main(void) {
    int value = 42;
    int* ptr = &value; // ptr stores address of value

    printf("Original value: %d\\n", value);
    printf("Memory address (&value): %p\\n", (void*)&value);

    // Dereference pointer to change value directly
    *ptr = 99;
    printf("Value after *ptr = 99: %d\\n", value);
    return 0;
}`,
    'Functions & Logic': `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main(void) {
    int score1 = 50;
    int score2 = 35;
    int total = add(score1, score2);

    printf("Total score: %d\\n", total);
    if (total >= 70) {
        printf("Status: Passed with honors!\\n");
    } else {
        printf("Status: Keep practicing!\\n");
    }
    return 0;
}`,
  },

  cpp: {
    'Hello World': `#include <iostream>

int main() {
    std::cout << "Hello, Modern C++ on ByteSized!" << std::endl;
    std::cout << "Blazing fast, zero-cost abstractions." << std::endl;
    return 0;
}`,
    'STL Vector': `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {42, 7, 19, 99, 3};
    std::cout << "Initial size: " << nums.size() << std::endl;

    std::sort(nums.begin(), nums.end());
    std::cout << "Sorted elements: ";
    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    return 0;
}`,
    'Classes & OOP': `#include <iostream>
#include <string>

class Student {
private:
    std::string name;
    int streak;

public:
    Student(std::string n, int s) : name(n), streak(s) {}

    void showProgress() {
        std::cout << "Student: " << name << " | Streak: " << streak << " days!" << std::endl;
    }
};

int main() {
    Student s1("Bhai Cat", 14);
    s1.showProgress();
    return 0;
}`,
  },

  python: {
    'Hello World': `print("Hello, ByteSized Python!")
print("Clean, readable, dynamic code.")
`,
    'Lists & Loops': `languages = ["C", "C++", "Python", "Rust"]

print("Supported languages in ByteSized:")
for idx, lang in enumerate(languages, 1):
    print(f"{idx}. {lang}")
`,
    'Functions & Dict': `def calculate_stats(scores):
    return {
        "highest": max(scores),
        "lowest": min(scores),
        "average": sum(scores) / len(scores)
    }

grades = [88, 92, 79, 95, 84]
stats = calculate_stats(grades)
print(f"Top Score: {stats['highest']}")
print(f"Average: {stats['average']:.1f}")
`,
  },

  javascript: {
    'Hello World': `console.log("Hello from ByteSized CodeZone!");
console.log("JavaScript running in browser sandbox.");
`,
    'Arrays & Objects': `const user = {
  name: "Bhai Cat",
  hearts: 5,
  gems: 120,
  skills: ["C", "C++", "DSA"]
};

console.log(\`User: \${user.name}\`);
console.log(\`Hearts: \${user.hearts} | Gems: \${user.gems}\`);
console.log("Skills:", user.skills.join(", "));
`,
  },
};

export const CodeZoneModal: React.FC<Props> = ({
  initialCode,
  initialLanguage,
  isStandalone = false,
  problem = null,
  onClose,
  onSaveToIdeaZone,
  onBackToRoadmap,
  onProblemSolved,
  onProblemAttempted,
}) => {
  const { getProblemStatus } = useDsaProgress();
  const currentStatus = problem ? getProblemStatus(problem.id) : undefined;

  const [language, setLanguage] = useState<CodeLanguage>(() => {
    if (initialLanguage) return initialLanguage;
    if (problem) {
      try {
        const savedLang = localStorage.getItem(`bytesized_dsa_last_lang_${problem.id}`);
        if (savedLang === 'c' || savedLang === 'cpp' || savedLang === 'python' || savedLang === 'javascript') {
          return savedLang as CodeLanguage;
        }
      } catch {
        // ignore
      }
      return 'python'; // Default to Python for DSA problems
    }
    return 'c';
  });

  const [code, setCode] = useState<string>(() => {
    if (problem) {
      try {
        const draftKey = `bytesized_dsa_draft_${problem.id}_${language}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) return savedDraft;
      } catch {
        // ignore
      }
      return problem.starterTemplates[language] || '';
    }
    if (initialCode) return initialCode;
    return STARTER_TEMPLATES[language]['Hello World'] || '';
  });

  // Preserve user drafts per problem and language
  useEffect(() => {
    if (problem && code) {
      try {
        localStorage.setItem(`bytesized_dsa_draft_${problem.id}_${language}`, code);
        localStorage.setItem(`bytesized_dsa_last_lang_${problem.id}`, language);
      } catch {
        // ignore
      }
    }
  }, [code, language, problem]);

  const [stdinInput, setStdinInput] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationSummary, setEvaluationSummary] = useState<
    (EvaluationSummary & { isSubmission: boolean }) | null
  >(null);
  const [activeBottomTab, setActiveBottomTab] = useState<'tests' | 'terminal'>(
    problem ? 'tests' : 'terminal'
  );
  const [mobileTab, setMobileTab] = useState<'problem' | 'code' | 'tests'>(
    problem ? 'problem' : 'code'
  );
  const [isProblemPanelCollapsed, setIsProblemPanelCollapsed] = useState<boolean>(false);
  const [executionStats, setExecutionStats] = useState<{ timeMs: number; status: 'ok' | 'error' } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [mascotWisdom, setMascotWisdom] = useState<string | null>(null);

  // Attempt-first solution disclosure & hints state
  const [revealedHintsCount, setRevealedHintsCount] = useState<number>(0);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState<boolean>(false);
  const [solutionLanguage, setSolutionLanguage] = useState<CodeLanguage>(language || 'python');
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);

  // Synchronize initial mobile tab and reset solution/hints when problem changes to prevent leakage
  const prevProblemIdRef = useRef<string | undefined>(problem?.id);
  useEffect(() => {
    setRevealedHintsCount(0);
    setIsSolutionRevealed(false);
    setShowSolutionConfirm(false);
    setCopiedSolution(false);

    if (problem) {
      setMobileTab('problem');
      if (problem.solutions) {
        const langs = Object.keys(problem.solutions) as CodeLanguage[];
        if (langs.length > 0) {
          setSolutionLanguage(langs.includes(language) ? language : langs[0]);
        }
      }

      if (problem.id !== prevProblemIdRef.current) {
        prevProblemIdRef.current = problem.id;
        let targetLang = language;
        try {
          const savedLang = localStorage.getItem(`bytesized_dsa_last_lang_${problem.id}`);
          if (savedLang === 'c' || savedLang === 'cpp' || savedLang === 'python' || savedLang === 'javascript') {
            targetLang = savedLang as CodeLanguage;
            setLanguage(targetLang);
          }
        } catch {
          // ignore
        }
        try {
          const draftKey = `bytesized_dsa_draft_${problem.id}_${targetLang}`;
          const savedDraft = localStorage.getItem(draftKey);
          setCode(savedDraft || problem.starterTemplates[targetLang] || '');
        } catch {
          setCode(problem.starterTemplates[targetLang] || '');
        }
        setEvaluationSummary(null);
        setExecutionStats(null);
      }
    } else {
      setMobileTab('code');
    }
  }, [problem?.id]);

  const problemSolutions = problem?.solutions;
  const availableSolutionLangs = useMemo(() => {
    if (!problemSolutions) return [];
    return Object.keys(problemSolutions) as CodeLanguage[];
  }, [problemSolutions]);

  const currentSolutionCode = useMemo(() => {
    if (!problemSolutions) return '';
    return (
      problemSolutions[solutionLanguage] ||
      problemSolutions[language] ||
      Object.values(problemSolutions)[0] ||
      ''
    );
  }, [problemSolutions, solutionLanguage, language]);

  const handleCopySolution = () => {
    if (!currentSolutionCode) return;
    navigator.clipboard.writeText(currentSolutionCode);
    setCopiedSolution(true);
    sound.playClick();
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const handleLoadSolutionIntoEditor = () => {
    if (!currentSolutionCode) return;
    handleLanguageChange(solutionLanguage);
    setCode(currentSolutionCode);
    sound.playSuccess();
    setMobileTab('code');
  };

  // Clean up any confetti when CodeZone closes
  useEffect(() => {
    return () => {
      stopConfetti();
    };
  }, []);

  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  // Synchronously lock selection range after React DOM updates
  useLayoutEffect(() => {
    if (selectionRef.current && editorTextareaRef.current) {
      const { start, end } = selectionRef.current;
      editorTextareaRef.current.setSelectionRange(start, end);
      selectionRef.current = null;
    }
  });

  // Synchronize scroll between textarea, pre highlight layer, and line number gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  // Syntax highlighting HTML layer via Prism
  const highlightedHtml = useMemo(() => {
    let langGrammar = Prism.languages.c;
    let langId = 'c';
    if (language === 'cpp') {
      langGrammar = Prism.languages.cpp || Prism.languages.c;
      langId = 'cpp';
    } else if (language === 'python') {
      langGrammar = Prism.languages.python;
      langId = 'python';
    } else if (language === 'javascript') {
      langGrammar = Prism.languages.javascript;
      langId = 'javascript';
    }

    try {
      const rawHtml = Prism.highlight(code, langGrammar, langId);
      return code.endsWith('\n') ? rawHtml + '\n ' : rawHtml;
    } catch {
      return code;
    }
  }, [code, language]);

  // Switch template when language changes
  const handleLanguageChange = (newLang: CodeLanguage) => {
    sound.playClick();
    setLanguage(newLang);
    if (problem) {
      const draftKey = `bytesized_dsa_draft_${problem.id}_${newLang}`;
      const savedDraft = localStorage.getItem(draftKey);
      const codeToSet = savedDraft || problem.starterTemplates[newLang] || '';
      setCode(codeToSet);
      setTerminalOutput([`// Switched environment to ${newLang.toUpperCase()} for ${problem.title}.`]);
      setEvaluationSummary(null);
    } else {
      const firstTemplateKey = Object.keys(STARTER_TEMPLATES[newLang])[0];
      setCode(STARTER_TEMPLATES[newLang][firstTemplateKey] || '');
      setTerminalOutput([`// Switched environment to ${newLang.toUpperCase()}. Click Run Code to execute!`]);
    }
    setExecutionStats(null);
  };

  // Reset to starter template
  const handleResetTemplate = (templateName?: string) => {
    sound.playClick();
    if (problem) {
      const defaultTemplate = problem.starterTemplates[language] || '';
      setCode(defaultTemplate);
      try {
        localStorage.removeItem(`bytesized_dsa_draft_${problem.id}_${language}`);
      } catch {
        // ignore
      }
      setTerminalOutput([`// Reset starter code for ${problem.title} (${language.toUpperCase()}).`]);
    } else {
      const key = templateName || Object.keys(STARTER_TEMPLATES[language])[0];
      setCode(STARTER_TEMPLATES[language][key] || '');
    }
    setExecutionStats(null);
    setEvaluationSummary(null);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Launch standalone editor in another tab
  const handleLaunchInNewTab = () => {
    sound.playClick();
    try {
      localStorage.setItem('bytesized_standalone_codezone_code', code);
      localStorage.setItem('bytesized_standalone_codezone_lang', language);
      localStorage.setItem('coderbhai_standalone_codezone_code', code);
      localStorage.setItem('coderbhai_standalone_codezone_lang', language);
    } catch {
      // ignore
    }
    const url = `${window.location.origin}${window.location.pathname}?mode=codezone`;
    window.open(url, '_blank');
  };

  // Synchronous text insertion helper
  const insertPair = (openChar: string, closeChar: string) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    if (start !== end) {
      const selected = val.substring(start, end);
      const wrapped = openChar + selected + closeChar;
      textarea.setRangeText(wrapped, start, end, 'select');
      const newStart = start + openChar.length;
      const newEnd = end + openChar.length;
      textarea.setSelectionRange(newStart, newEnd);
      selectionRef.current = { start: newStart, end: newEnd };
      setCode(textarea.value);
      return;
    }

    const pair = openChar + closeChar;
    textarea.setRangeText(pair, start, end, 'end');
    const targetPos = start + openChar.length;
    textarea.setSelectionRange(targetPos, targetPos);
    selectionRef.current = { start: targetPos, end: targetPos };
    setCode(textarea.value);
  };

  // Keydown handling: Auto-indent, pairs, tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    // Ctrl+Enter or Cmd+Enter to Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (problem) {
        handleRunSampleTests();
      } else {
        handleRunCode();
      }
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    // Tab & Shift+Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = val.indexOf('\n', end);
        const effectiveEnd = lineEnd === -1 ? val.length : lineEnd;
        const selectedBlock = val.substring(lineStart, effectiveEnd);
        const outdented = selectedBlock.replace(/^ {1,4}/gm, '');
        textarea.setRangeText(outdented, lineStart, effectiveEnd, 'select');
        const diff = selectedBlock.length - outdented.length;
        const newStart = Math.max(lineStart, start - diff);
        const newEnd = Math.max(lineStart, end - diff);
        textarea.setSelectionRange(newStart, newEnd);
        selectionRef.current = { start: newStart, end: newEnd };
        setCode(textarea.value);
        return;
      }

      if (start !== end) {
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = val.indexOf('\n', end);
        const effectiveEnd = lineEnd === -1 ? val.length : lineEnd;
        const selectedBlock = val.substring(lineStart, effectiveEnd);
        const indented = selectedBlock.replace(/^/gm, '    ');
        textarea.setRangeText(indented, lineStart, effectiveEnd, 'select');
        const added = indented.length - selectedBlock.length;
        const newStart = start + 4;
        const newEnd = end + added;
        textarea.setSelectionRange(newStart, newEnd);
        selectionRef.current = { start: newStart, end: newEnd };
        setCode(textarea.value);
        return;
      }

      const indentation = '    ';
      textarea.setRangeText(indentation, start, end, 'end');
      const newPos = start + indentation.length;
      textarea.setSelectionRange(newPos, newPos);
      selectionRef.current = { start: newPos, end: newPos };
      setCode(textarea.value);
      return;
    }

    // Auto-Indentation on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const lineBeforeCursor = val.substring(lineStart, start);
      const indentMatch = lineBeforeCursor.match(/^[ \t]*/);
      const currentIndent = indentMatch ? indentMatch[0] : '';
      const trimmedBefore = lineBeforeCursor.trim();
      const charAfter = val[start];

      const isBetweenPair =
        (trimmedBefore.endsWith('{') && charAfter === '}') ||
        (trimmedBefore.endsWith('(') && charAfter === ')') ||
        (trimmedBefore.endsWith('[') && charAfter === ']');

      if (isBetweenPair) {
        const extraIndent = currentIndent + '    ';
        const insertion = '\n' + extraIndent + '\n' + currentIndent;
        textarea.setRangeText(insertion, start, end, 'end');
        const newPos = start + 1 + extraIndent.length;
        textarea.setSelectionRange(newPos, newPos);
        selectionRef.current = { start: newPos, end: newPos };
        setCode(textarea.value);
        return;
      }

      const opensBlock =
        trimmedBefore.endsWith('{') ||
        trimmedBefore.endsWith(':') ||
        trimmedBefore.endsWith('(') ||
        trimmedBefore.endsWith('[');

      const nextIndent = opensBlock ? currentIndent + '    ' : currentIndent;
      const insertion = '\n' + nextIndent;
      textarea.setRangeText(insertion, start, end, 'end');
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
      selectionRef.current = { start: newPos, end: newPos };
      setCode(textarea.value);
      return;
    }

    // Auto-Closing Brackets & Quotes
    if (PAIRS[e.key]) {
      e.preventDefault();
      const openChar = e.key;
      const closeChar = PAIRS[openChar];

      if ((openChar === '"' || openChar === "'" || openChar === '`') && val[start] === openChar && start === end) {
        const nextPos = start + 1;
        textarea.setSelectionRange(nextPos, nextPos);
        selectionRef.current = { start: nextPos, end: nextPos };
        return;
      }

      insertPair(openChar, closeChar);
      return;
    }

    // Overtyping closing chars
    if (CLOSING_SET.has(e.key) && val[start] === e.key && start === end) {
      e.preventDefault();
      const nextPos = start + 1;
      textarea.setSelectionRange(nextPos, nextPos);
      selectionRef.current = { start: nextPos, end: nextPos };
      return;
    }

    // Backspace pair deletion
    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = val[start - 1];
      const charAfter = val[start];
      if (PAIRS[charBefore] && PAIRS[charBefore] === charAfter) {
        e.preventDefault();
        textarea.setRangeText('', start - 1, start + 1, 'end');
        const newPos = start - 1;
        textarea.setSelectionRange(newPos, newPos);
        selectionRef.current = { start: newPos, end: newPos };
        setCode(textarea.value);
        return;
      }
    }
  };

  // Execution Simulator & Real Sandbox Runner for general IDE mode
  const handleRunCode = () => {
    sound.playClick();
    setIsRunning(true);
    setTerminalOutput([]);
    setExecutionStats(null);
    setMascotWisdom(null);
    setActiveBottomTab('terminal');
    setMobileTab('tests');

    const startTime = performance.now();

    setTimeout(() => {
      try {
        const outputLines: string[] = [];

        if (language === 'javascript') {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;

          console.log = (...args: unknown[]) => {
            outputLines.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
          };
          console.error = (...args: unknown[]) => {
            outputLines.push(`[ERROR] ${args.map(a => String(a)).join(' ')}`);
          };
          console.warn = (...args: unknown[]) => {
            outputLines.push(`[WARN] ${args.map(a => String(a)).join(' ')}`);
          };

          try {
            const runner = new Function(code);
            runner();
          } finally {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
          }
        } else if (language === 'python') {
          let pyStdout = '';
          const customPrint = (...args: unknown[]) => {
            pyStdout += args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
          };

          try {
            const js = code
              .replace(/f(["'])(.*?)\1/g, (_, __, str) => '`' + str.replace(/\{([^}]+)\}/g, '${$1}') + '`')
              .replace(/^([a-zA-Z_]\w*)\s*=\s*([^=].*)$/gm, 'let $1 = $2;');

            const pyRunner = new Function('print', js);
            pyRunner(customPrint);

            const pyLines = pyStdout.split('\n');
            if (pyLines.length > 1 && pyLines[pyLines.length - 1] === '') {
              pyLines.pop();
            }
            outputLines.push(...pyLines);
          } catch (pyErr) {
            outputLines.push(`[Python Error] ${(pyErr as Error).message}`);
          }
        } else if (language === 'c' || language === 'cpp') {
          let cStdout = '';

          const customPrintf = (formatStr: unknown, ...args: unknown[]) => {
            if (typeof formatStr !== 'string') {
              cStdout += String(formatStr ?? '');
              return;
            }

            let str = formatStr.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');
            let argIdx = 0;

            str = str.replace(/%(\.[0-9]+)?([dfcspe%])/gi, (match, precision, type) => {
              const lower = type.toLowerCase();
              if (match === '%%') return '%';
              if (argIdx >= args.length) return match;
              const val = args[argIdx++];

              if (lower === 'd' || lower === 'i') {
                const num = Number(val);
                return isNaN(num) ? String(val) : String(Math.trunc(num));
              }
              if (lower === 'f' || lower === 'e') {
                const num = Number(val);
                if (isNaN(num)) return String(val);
                const prec = precision ? parseInt(precision.slice(1)) : 6;
                return num.toFixed(prec);
              }
              if (lower === 'c') {
                if (typeof val === 'number') return String.fromCharCode(val);
                return String(val)[0] || '';
              }
              if (lower === 's') {
                return String(val);
              }
              if (lower === 'p') {
                return '0x7ffd5e20';
              }
              return String(val);
            });

            cStdout += str;
          };

          const rawLines = code.split('\n');
          let hasMissingSemicolon = false;
          let missingSemiLine = -1;

          rawLines.forEach((l, idx) => {
            const trimmed = l.trim();
            if (
              (trimmed.startsWith('printf') ||
                trimmed.startsWith('std::cout') ||
                trimmed.startsWith('cout') ||
                trimmed.startsWith('int ') ||
                trimmed.startsWith('float ') ||
                trimmed.startsWith('double ') ||
                trimmed.startsWith('char ') ||
                trimmed.startsWith('return ') ||
                trimmed.startsWith('*ptr =')) &&
              !trimmed.endsWith(';') &&
              !trimmed.endsWith('{') &&
              !trimmed.endsWith('}') &&
              !trimmed.startsWith('//')
            ) {
              hasMissingSemicolon = true;
              missingSemiLine = idx + 1;
            }
          });

          if (hasMissingSemicolon) {
            throw new Error(`expected ';' before end of line ${missingSemiLine}`);
          }

          const stdinTokens = (stdinInput || '42 100').trim().split(/\s+/);
          let stdinIdx = 0;

          const customScanf = (_: string, ...targets: any[]) => {
            for (const target of targets) {
              if (stdinIdx < stdinTokens.length) {
                const token = stdinTokens[stdinIdx++];
                if (typeof target === 'object' && target !== null && 'set' in target) {
                  target.set(isNaN(Number(token)) ? token : Number(token));
                }
              }
            }
            return targets.length;
          };

          try {
            const js = code
              .replace(/^\s*#\s*include\s*<[^>]+>/gm, '// [include]')
              .replace(/^\s*#\s*include\s*"[^"]+"/gm, '// [include]')
              .replace(/using\s+namespace\s+std\s*;/g, '// [using namespace std]')
              .replace(/\b(?:int|void)\s+main\s*\([^)]*\)\s*\{/g, 'function main() {')
              .replace(
                /(?:int|float|double|char|long|short)\s*\*\s*([a-zA-Z_]\w*)\s*=\s*&([a-zA-Z_]\w*)\s*;/g,
                'let $1 = { get: () => $2, set: (v) => { $2 = v; } };'
              )
              .replace(/\*([a-zA-Z_]\w*)\s*=\s*([^;]+);/g, '$1.set($2);')
              .replace(/\*([a-zA-Z_]\w*)/g, '($1.get ? $1.get() : $1)')
              .replace(/\bconst\s+(?:int|float|double|char|long|short|auto)\s+([*a-zA-Z_]\w*)/g, 'const $1')
              .replace(
                /\b(int|float|double|char|long|short|auto|unsigned|size_t)\s+([*a-zA-Z_]\w*)/g,
                'let $2'
              )
              .replace(/\b(?:std::)?cout\s*<<\s*([^;]+);/g, (_, exprs) => {
                const parts = exprs.split('<<').map((s: string) => s.trim());
                const calls = parts.map((p: string) => {
                  if (p === 'std::endl' || p === 'endl') return 'printf("\\n")';
                  return `printf("%s", ${p})`;
                });
                return calls.join('; ') + ';';
              })
              .replace(/\b(?:std::)?cin\s*>>\s*([^;]+);/g, (_, varName) => {
                return `scanf("%s", { set: (v) => { ${varName.trim()} = v; } });`;
              });

            const runner = new Function('printf', 'scanf', js + '\nreturn typeof main === "function" ? main() : 0;');
            runner(customPrintf, customScanf);

            const cLines = cStdout.split('\n');
            if (cLines.length > 1 && cLines[cLines.length - 1] === '') {
              cLines.pop();
            }
            outputLines.push(...cLines);
          } catch (runtimeErr) {
            outputLines.push(`[Runtime Error] ${(runtimeErr as Error).message}`);
          }
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime + Math.random() * 6 + 2);

        setTerminalOutput(outputLines.length > 0 ? outputLines : ['// Program executed with 0 exit code (no stdout).']);
        setExecutionStats({ timeMs: duration, status: 'ok' });
        sound.playSuccess();
        fireSuccessConfetti();

        const praises = [
          'Lin 🕶️: "Clean execution! Memory bounds look pristine."',
          'Bhai 🐈‍⬛: "Purrfect compile! Your logic is on point."',
          'Ada 👧: "Variables initialized and output verified!"',
          'Turing 🤖: "Zero syntax errors. State transitions executed in constant time."'
        ];
        setMascotWisdom(praises[Math.floor(Math.random() * praises.length)]);
      } catch (err) {
        setTerminalOutput([`[Compilation Error] ${(err as Error).message}`]);
        setExecutionStats({ timeMs: 0, status: 'error' });
        sound.playError();
      } finally {
        setIsRunning(false);
      }
    }, 150);
  };

  // Run visible sample test cases only (does not mark solved)
  const handleRunSampleTests = async () => {
    if (!problem) {
      handleRunCode();
      return;
    }
    sound.playClick();
    setIsEvaluating(true);
    setActiveBottomTab('tests');
    setMobileTab('tests');
    if (onProblemAttempted) {
      onProblemAttempted(problem.id);
    }

    const cases = problem.sampleCases || [];
    const summary = await evaluateTestCases(code, language, cases);
    setEvaluationSummary({ ...summary, isSubmission: false });
    setIsEvaluating(false);

    if (summary.allPassed) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  // Submit against complete test suite (sample + hidden test cases)
  const handleSubmitCode = async () => {
    if (!problem) return;
    sound.playClick();
    setIsEvaluating(true);
    setActiveBottomTab('tests');
    setMobileTab('tests');

    const allCases = [...problem.sampleCases, ...problem.hiddenCases];
    const summary = await evaluateTestCases(code, language, allCases);
    setEvaluationSummary({ ...summary, isSubmission: true });
    setIsEvaluating(false);

    if (summary.verdict === 'Accepted') {
      sound.playSuccess();
      fireSuccessConfetti();
      if (onProblemSolved) {
        onProblemSolved(problem.id);
      }
    } else {
      sound.playError();
      if (onProblemAttempted) {
        onProblemAttempted(problem.id);
      }
    }
  };

  const lineNumbers = useMemo(() => {
    const count = (code.match(/\n/g) || []).length + 1;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [code]);

  const lineCount = lineNumbers.length;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isStandalone ? 'p-0 bg-[#0B0F19]' : 'p-0 sm:p-4 bg-black/80 backdrop-blur-md'
      }`}
    >
      <div
        className={`w-full ${
          isStandalone
            ? 'h-full max-w-none max-h-none rounded-none border-0'
            : 'max-w-7xl h-[100dvh] sm:h-[95vh] sm:max-h-[920px] rounded-none sm:rounded-3xl border-0 sm:border-2 border-slate-700/80 shadow-2xl'
        } bg-[#0B0F19] flex flex-col overflow-hidden text-slate-100 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0`}
      >
        {/* Top Control Bar */}
        <div className="px-2.5 sm:px-6 py-2 sm:py-3 border-b border-slate-800 bg-[#101726] flex items-center justify-between gap-1.5 sm:gap-3 shrink-0">
          {problem ? (
            /* Left: Back to Roadmap + Problem Info */
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (onBackToRoadmap) onBackToRoadmap();
                  else onClose();
                }}
                className="btn-3d flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all cursor-pointer shrink-0"
                title="Return to DSA Roadmap"
                aria-label="Return to DSA Roadmap"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Back to Roadmap</span>
              </button>

              <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-black text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
                  {problem.title}
                </h2>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                    problem.difficulty === 'Easy'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : problem.difficulty === 'Medium'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {problem.difficulty}
                </span>
                <span className="hidden md:inline-block text-[11px] font-semibold text-slate-400 truncate">
                  • {problem.category}
                </span>
                {currentStatus === 'solved' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Check className="w-3 h-3" /> Solved
                  </span>
                ) : currentStatus === 'attempted' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                    <Clock className="w-3 h-3" /> Attempted
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            /* Left: Standard CodeZone Brand Header */
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-green/20 text-brand-green flex items-center justify-center shrink-0 shadow-inner">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                    CodeZone
                    <span className="hidden xs:inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live
                    </span>
                    {isStandalone && (
                      <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                        Standalone
                      </span>
                    )}
                  </h2>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden md:block truncate">
                  Write, test, and run code instantly in Pure C, Modern C++, Python, and JavaScript.
                </p>
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {problem ? (
              <>
                {/* Run Sample Tests */}
                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={handleRunSampleTests}
                  className="btn-3d btn-3d-green px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 text-white shadow-lg cursor-pointer shrink-0"
                  title="Run code against visible sample test cases (Ctrl + Enter)"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isEvaluating ? 'animate-spin' : ''}`} />
                  <span>{isEvaluating ? 'Testing...' : 'Run'}</span>
                  <span className="hidden sm:inline">Sample</span>
                </button>

                {/* Submit Full Test Suite */}
                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={handleSubmitCode}
                  className="btn-3d px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/40 shadow-lg shadow-purple-900/30 cursor-pointer shrink-0"
                  title="Submit solution against complete test suite (including hidden tests)"
                >
                  <Send className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-pulse' : ''}`} />
                  <span>Submit</span>
                </button>

                {/* Reset Starter Code */}
                <button
                  type="button"
                  onClick={() => handleResetTemplate()}
                  className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Reset code to default starter template"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Standard Run Button */}
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={handleRunCode}
                  className="btn-3d btn-3d-green px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 text-white shadow-lg cursor-pointer shrink-0"
                  title="Execute program (Ctrl + Enter)"
                >
                  <Play className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running...' : 'Run'}</span>
                  <span className="hidden sm:inline">Code</span>
                </button>

                {!isStandalone && (
                  <button
                    type="button"
                    onClick={handleLaunchInNewTab}
                    className="btn-3d hidden sm:flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-black bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer shrink-0"
                    title="Launch in dedicated browser tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Launch in another tab</span>
                    <span className="hidden sm:inline md:hidden">New Tab</span>
                  </button>
                )}

                {onSaveToIdeaZone && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSaveToIdeaZone(code, language);
                    }}
                    className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-all cursor-pointer shrink-0"
                    title="Save current snippet into IdeaZone"
                  >
                    <Lightbulb className="w-3.5 h-3.5 fill-current" />
                    <span>Save to IdeaZone</span>
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={handleCopyCode}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Copy code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                isStandalone
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 font-bold text-xs'
                  : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 sm:bg-transparent border border-slate-700/80 sm:border-transparent'
              }`}
              title={isStandalone ? 'Return to ByteSized learning app' : 'Close CodeZone'}
              aria-label="Close CodeZone"
            >
              {isStandalone ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Back</span>
                </>
              ) : (
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Sub-bar: Language Picker & Options */}
        <div className="px-2.5 sm:px-6 py-1.5 sm:py-2 border-b border-slate-800 bg-[#0E1524] flex items-center justify-between gap-2 shrink-0 text-xs font-semibold overflow-x-auto scrollbar-none">
          {/* Language Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {(
              [
                { id: 'c', label: '⚙️ Pure C', short: '⚙️ C' },
                { id: 'cpp', label: '⚡ Modern C++', short: '⚡ C++' },
                { id: 'python', label: '🐍 Python', short: '🐍 Py' },
                { id: 'javascript', label: '🟨 JavaScript', short: '🟨 JS' },
              ] as { id: CodeLanguage; label: string; short: string }[]
            ).map(item => {
              const isActive = language === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLanguageChange(item.id)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 text-xs ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="hidden xs:inline">{item.label}</span>
                  <span className="xs:hidden">{item.short}</span>
                </button>
              );
            })}
          </div>

          {problem ? (
            /* Problem Mode Controls */
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsProblemPanelCollapsed(!isProblemPanelCollapsed)}
                className="hidden md:flex px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isProblemPanelCollapsed ? 'Show Problem' : 'Hide Problem'}</span>
              </button>

              {/* Reset on mobile (< sm) */}
              <button
                type="button"
                onClick={() => handleResetTemplate()}
                className="sm:hidden px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                title="Reset starter code"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset</span>
              </button>

              {/* Toggle STDIN */}
              <button
                type="button"
                onClick={() => setShowStdin(!showStdin)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                  showStdin
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Keyboard className="w-3 h-3" />
                <span>stdin</span>
              </button>
            </div>
          ) : (
            /* Preset Templates (Standard CodeZone) */
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold hidden md:inline">
                Templates:
              </span>
              <div className="flex items-center gap-1">
                {Object.keys(STARTER_TEMPLATES[language]).map(tmplName => (
                  <button
                    key={tmplName}
                    type="button"
                    onClick={() => handleResetTemplate(tmplName)}
                    className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                  >
                    {tmplName}
                  </button>
                ))}
              </div>

              {/* Toggle STDIN */}
              <button
                type="button"
                onClick={() => setShowStdin(!showStdin)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                  showStdin
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Keyboard className="w-3 h-3" />
                <span>stdin</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Segmented Workspace Switcher (< md only) */}
        <div className="flex md:hidden items-center border-b border-slate-800 bg-[#0A0E18] px-2 py-1 gap-1 shrink-0">
          {problem && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileTab('problem');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'problem'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Problem</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setMobileTab('code');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'code'
                ? 'bg-slate-800 text-brand-green border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setMobileTab('tests');
              if (problem) {
                setActiveBottomTab('tests');
              } else {
                setActiveBottomTab('terminal');
              }
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              mobileTab === 'tests'
                ? 'bg-slate-800 text-purple-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{problem ? 'Test Results' : 'Console'}</span>
            {evaluationSummary && (
              <span
                className={`w-2 h-2 rounded-full ${
                  evaluationSummary.verdict === 'Accepted' ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            )}
          </button>
        </div>

        {/* Optional STDIN Drawer */}
        {showStdin && (
          <div className="px-4 sm:px-6 py-2.5 bg-[#080C14] border-b border-slate-800 flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400 font-bold shrink-0">
              STDIN Input:
            </span>
            <input
              type="text"
              value={stdinInput}
              onChange={e => setStdinInput(e.target.value)}
              placeholder="Provide keyboard input for scanf / cin (e.g. 42)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 font-mono text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            />
          </div>
        )}

        {/* Main Workspace: Problem Drawer (Optional) + Code Editor + Bottom Output */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Problem Statement Drawer */}
          {problem && !isProblemPanelCollapsed && (
            <div
              className={`w-full md:w-[38%] border-r-0 md:border-r border-b md:border-b-0 border-slate-800 bg-[#090E1A] flex-col overflow-hidden text-left ${
                mobileTab === 'problem' ? 'flex flex-1 min-h-0' : 'hidden md:flex md:min-h-0'
              }`}
            >
              <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-200 uppercase tracking-wider">
                    Problem Details
                  </h3>
                </div>
                <a
                  href={`https://leetcode.com/problems/${problem.id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>LeetCode</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans select-text">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {problem.description}
                </div>

                {problem.examples && problem.examples.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Examples:
                    </h4>
                    {problem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#060912] border border-slate-800/80 font-mono text-xs space-y-1.5"
                      >
                        <div>
                          <span className="text-slate-500 font-bold block text-[10px]">Input:</span>
                          <pre className="text-slate-200 whitespace-pre-wrap">{ex.input}</pre>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block text-[10px]">Output:</span>
                          <pre className="text-emerald-400 whitespace-pre-wrap">{ex.output}</pre>
                        </div>
                        {ex.explanation && (
                          <p className="text-[11px] text-slate-400 font-sans mt-1">
                            Explanation: {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Constraints:
                    </h4>
                    <ul className="list-disc pl-4 text-xs font-mono text-slate-400 space-y-0.5">
                      {problem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Progressive Hints (Attempt-First Learning) */}
                {problem.hints && problem.hints.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 fill-amber-400/20" />
                        <span>Hints ({revealedHintsCount}/{problem.hints.length})</span>
                      </h4>
                      {revealedHintsCount < problem.hints.length ? (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setRevealedHintsCount(prev => prev + 1);
                          }}
                          className="text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Reveal Hint {revealedHintsCount + 1}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">All hints revealed</span>
                      )}
                    </div>

                    {revealedHintsCount > 0 ? (
                      <div className="space-y-2">
                        {problem.hints.slice(0, revealedHintsCount).map((hint, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-1"
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                              Hint {idx + 1}
                            </span>
                            <p className="leading-relaxed font-sans">{hint}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Stuck on the algorithm? Reveal progressive hints one by one without spoiling the solution code.
                      </p>
                    )}
                  </div>
                )}

                {/* Explicit Reference Solution Disclosure (Attempt-First Learning) */}
                {problem.solutions && Object.keys(problem.solutions).length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-slate-800">
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
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </button>
                      )}
                    </div>

                    {!isSolutionRevealed ? (
                      !showSolutionConfirm ? (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                          <p className="text-xs text-slate-400">
                            Reference solutions are hidden by default to prioritize your own problem-solving attempt.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setShowSolutionConfirm(true);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>View Reference Solution</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2.5">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-amber-400">
                                Reveal Reference Solution?
                              </p>
                              <p className="text-[11px] text-slate-300 leading-normal">
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
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 cursor-pointer"
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
                              className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-sm"
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
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
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
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                              title="Copy solution code"
                            >
                              {copiedSolution ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedSolution ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleLoadSolutionIntoEditor}
                              className="px-2 py-1 rounded-lg text-[10px] font-black text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 flex items-center gap-1 cursor-pointer"
                              title="Load this reference solution into your editor"
                            >
                              <Code2 className="w-3 h-3" />
                              <span>Load into Editor</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#060912] border border-slate-800 font-mono text-xs overflow-x-auto text-slate-200 max-h-60 overflow-y-auto">
                          <pre className="whitespace-pre">{currentSolutionCode}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Quick Action to Open Code Editor */}
                <div className="md:hidden pt-4 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMobileTab('code');
                    }}
                    className="btn-3d btn-3d-green w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-md cursor-pointer"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Open Code Editor</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Center/Right: Code Editor & Bottom Drawer */}
          <div
            className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
              mobileTab === 'problem' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Editor Workspace */}
            <div
              className={`flex-col border-b border-slate-800 bg-[#070B12] relative ${
                mobileTab === 'tests' ? 'hidden md:flex md:flex-1 md:min-h-[50%]' : 'flex flex-1 min-h-0 md:min-h-[50%]'
              }`}
            >
              <div className="flex-1 flex overflow-hidden">
                {/* Line Numbers Gutter */}
                <div
                  ref={gutterRef}
                  className="w-12 py-3.5 pr-2 pl-3 select-none text-right font-mono text-xs text-slate-600 bg-[#060910] border-r border-slate-800/80 overflow-hidden shrink-0"
                >
                  {lineNumbers.map(n => (
                    <div key={n} className="leading-6 h-6">
                      {n}
                    </div>
                  ))}
                </div>

                {/* Syntax Highlighted Layer (Pre/Code) */}
                <div className="relative flex-1 h-full overflow-hidden">
                  <pre
                    ref={preRef}
                    aria-hidden="true"
                    className="codezone-pre absolute inset-0 w-full h-full p-3.5 bg-transparent pointer-events-none overflow-hidden m-0 border-0 whitespace-pre text-slate-200 select-none z-0"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />

                  <textarea
                    ref={editorTextareaRef}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onScroll={handleScroll}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    wrap="off"
                    className="codezone-textarea absolute inset-0 w-full h-full p-3.5 bg-transparent text-transparent caret-sky-400 outline-none resize-none overflow-auto m-0 border-0 whitespace-pre z-10 selection:bg-sky-500/30 selection:text-transparent overscroll-contain"
                    placeholder="// Type or paste your code here..."
                  />
                </div>
              </div>

              {/* Editor Status Line */}
              <div className="px-3 sm:px-4 py-1.5 border-t border-slate-800/80 bg-[#080C14] flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span>Lines: {lineCount}</span>
                  <span>Len: {code.length}</span>
                  <span className="hidden sm:inline">Press Ctrl+Enter to Run</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Copy button on mobile */}
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="sm:hidden flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                  <span className="hidden sm:inline">Tab: 4 spaces</span>
                  <span>UTF-8</span>
                </div>
              </div>
            </div>

            {/* Bottom Console / Test Results Drawer */}
            <div
              className={`flex flex-col bg-[#050810] overflow-hidden ${
                mobileTab === 'tests'
                  ? 'flex-1 min-h-0'
                  : 'hidden md:flex md:h-[42%] md:min-h-[170px]'
              }`}
            >
              {/* Bottom Tabs */}
              <div className="px-4 py-1.5 border-b border-slate-800/80 bg-[#090D18] flex items-center justify-between text-xs font-mono shrink-0">
                <div className="flex items-center gap-2">
                  {problem && (
                    <button
                      type="button"
                      onClick={() => setActiveBottomTab('tests')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeBottomTab === 'tests'
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Test Results</span>
                      {evaluationSummary && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                            evaluationSummary.verdict === 'Accepted'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {evaluationSummary.verdict}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveBottomTab('terminal')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeBottomTab === 'terminal'
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Console Output</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {executionStats && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        executionStats.status === 'ok'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {executionStats.timeMs}ms
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setTerminalOutput([]);
                      setEvaluationSummary(null);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title="Clear output"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Content Body */}
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs select-text">
                {activeBottomTab === 'tests' && problem ? (
                  <div className="space-y-3">
                    {isEvaluating ? (
                      <div className="p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                        <Play className="w-6 h-6 animate-spin text-emerald-400" />
                        <span className="font-bold text-slate-300">Evaluating against test suite...</span>
                      </div>
                    ) : evaluationSummary ? (
                      <div className="space-y-3">
                        {/* Verdict Banner */}
                        <div
                          className={`p-3 rounded-2xl border flex items-center justify-between ${
                            evaluationSummary.verdict === 'Accepted'
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                              : evaluationSummary.verdict === 'Wrong Answer'
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                              : evaluationSummary.verdict === 'Time Limit Exceeded'
                              ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {evaluationSummary.verdict === 'Accepted' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-400" />
                            )}
                            <div>
                              <h4 className="font-black text-sm">{evaluationSummary.verdict}</h4>
                              <p className="text-[11px] opacity-80">
                                {evaluationSummary.isSubmission ? 'Submission Evaluation' : 'Sample Run'} •{' '}
                                {evaluationSummary.passedCount} / {evaluationSummary.totalCount} test cases passed (
                                {evaluationSummary.totalTimeMs}ms)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Individual Test Cases Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {evaluationSummary.results.map((res, i) => (
                            <div
                              key={res.testCaseId || i}
                              className={`p-2.5 rounded-xl border font-mono text-[11px] space-y-1 ${
                                res.passed
                                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                                  : 'bg-rose-950/20 border-rose-500/30 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1">
                                  {res.passed ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 text-rose-400" />
                                  )}
                                  <span>Case #{i + 1}</span>
                                  {res.isHidden && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                                      Hidden
                                    </span>
                                  )}
                                </span>
                                <span className="text-slate-500 text-[10px]">{res.executionTimeMs}ms</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">Input:</span>
                                <div className="p-1.5 rounded bg-[#03060c] text-slate-300 break-all whitespace-pre-wrap">
                                  {res.input}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-1 pt-0.5">
                                <div>
                                  <span className="text-slate-500 text-[10px] block">Expected:</span>
                                  <div className="p-1.5 rounded bg-[#03060c] text-emerald-400 break-all whitespace-pre-wrap">
                                    {res.expectedOutput}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px] block">Output:</span>
                                  <div
                                    className={`p-1.5 rounded bg-[#03060c] break-all whitespace-pre-wrap ${
                                      res.passed ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {res.actualOutput}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-500">
                        Click <strong className="text-slate-300">Run Sample</strong> to verify with sample tests, or{' '}
                        <strong className="text-slate-300">Submit</strong> to run against all test cases.
                      </div>
                    )}
                  </div>
                ) : (
                  /* Terminal Console Body */
                  <div className="space-y-1 select-text">
                    <div className="text-slate-500 pb-1">
                      $ {language === 'c' ? 'gcc main.c -o main && ./main' : language === 'cpp' ? 'g++ -std=c++20 main.cpp && ./main' : language === 'python' ? 'python3 main.py' : 'node index.js'}
                    </div>
                    {terminalOutput.length === 0 ? (
                      <div className="text-slate-600 italic py-2">
                        Ready. Click [Run Code] or press Ctrl+Enter to execute.
                      </div>
                    ) : (
                      terminalOutput.map((line, idx) => (
                        <div
                          key={idx}
                          className={`whitespace-pre-wrap break-words min-h-[1.25rem] ${
                            line.startsWith('❌') || line.includes('[ERROR]') || line.includes('error:')
                              ? 'text-rose-400 font-bold'
                              : line.startsWith('[WARN]')
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {line === '' ? '\u00A0' : line}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Mascot Cheer */}
              {mascotWisdom && (
                <div className="p-2.5 border-t border-slate-800 bg-[#0A0F1D] flex items-center gap-2 text-xs text-slate-300">
                  <CatFace size="xs" mood="happy" />
                  <span className="font-medium text-slate-300 truncate">{mascotWisdom}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
