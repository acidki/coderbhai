import { describe, it, expect } from 'vitest';
import { executeCodeSandbox, evaluateTestCases } from '../utils/codeRunner';
import { getDsaProblemSpec, CURATED_DSA_PROBLEM_SPECS } from '../data/dsaProblemSpecs';
import { BLIND_75_ROADMAP, NEETCODE_150_ROADMAP } from '../data/dsaRoadmaps';

describe('Audit: Multi-Problem Evaluation Across Categories', () => {
  it('Evaluates Contains Duplicate across JavaScript, Python, C++, and C', async () => {
    const spec = getDsaProblemSpec('contains-duplicate');
    expect(spec).toBeDefined();

    // 1. JavaScript
    const jsCode = spec.solutions?.javascript || spec.starterTemplates.javascript;
    const jsSummary = await evaluateTestCases(jsCode, 'javascript', spec.sampleCases);
    expect(jsSummary.verdict).toBe('Accepted');
    expect(jsSummary.allPassed).toBe(true);

    // 2. Python
    const pyCode = spec.solutions?.python || spec.starterTemplates.python;
    const pySummary = await evaluateTestCases(pyCode, 'python', spec.sampleCases);
    expect(pySummary.verdict).toBe('Accepted');
    expect(pySummary.allPassed).toBe(true);

    // 3. C++
    const cppCode = spec.solutions?.cpp || spec.starterTemplates.cpp;
    const cppSummary = await evaluateTestCases(cppCode, 'cpp', spec.sampleCases);
    expect(cppSummary.verdict).toBe('Accepted');
    expect(cppSummary.allPassed).toBe(true);

    // 4. C
    const cCode = spec.solutions?.c || spec.starterTemplates.c;
    const cSummary = await evaluateTestCases(cCode, 'c', spec.sampleCases);
    expect(cSummary.verdict).toBe('Accepted');
    expect(cSummary.allPassed).toBe(true);
  });

  it('Evaluates Valid Anagram across supported languages', async () => {
    const spec = getDsaProblemSpec('valid-anagram');
    expect(spec).toBeDefined();

    const jsCode = spec.solutions?.javascript || spec.starterTemplates.javascript;
    const jsSummary = await evaluateTestCases(jsCode, 'javascript', spec.sampleCases);
    expect(jsSummary.verdict).toBe('Accepted');

    const pyCode = spec.solutions?.python || spec.starterTemplates.python;
    const pySummary = await evaluateTestCases(pyCode, 'python', spec.sampleCases);
    expect(pySummary.verdict).toBe('Accepted');
  });

  it('Evaluates Valid Parentheses across supported languages', async () => {
    const spec = getDsaProblemSpec('valid-parentheses');
    expect(spec).toBeDefined();

    const jsCode = spec.solutions?.javascript || spec.starterTemplates.javascript;
    const jsSummary = await evaluateTestCases(jsCode, 'javascript', spec.sampleCases);
    expect(jsSummary.verdict).toBe('Accepted');
  });

  it('Evaluates Binary Search across supported languages', async () => {
    const spec = getDsaProblemSpec('binary-search');
    expect(spec).toBeDefined();

    const jsCode = spec.solutions?.javascript || spec.starterTemplates.javascript;
    const jsSummary = await evaluateTestCases(jsCode, 'javascript', spec.sampleCases);
    expect(jsSummary.verdict).toBe('Accepted');
  });

  it('Rejects incorrect algorithms with Wrong Answer verdict', async () => {
    const spec = getDsaProblemSpec('contains-duplicate');
    const wrongSolution = `console.log("false");`;
    const summary = await evaluateTestCases(wrongSolution, 'javascript', spec.sampleCases);

    expect(summary.allPassed).toBe(false);
    expect(summary.verdict).toBe('Wrong Answer');
  });
});

describe('Audit: Language Simulation vs Genuine Runtime Discrepancies', () => {
  it('Identifies Python integer division (//) limitation in regex transpiler', async () => {
    // In Python, // is integer division. In JS, // is a line comment.
    const pythonCode = `x = 5 // 2\nprint(x)`;
    const res = await executeCodeSandbox(pythonCode, 'python');

    // In our transpiler, if // is untranspiled, it comments out '2\n' or produces 5 instead of 2.
    // Documenting actual behavior:
    expect(res.stdout.trim()).not.toBe('2'); // Real Python prints 2.
  });

  it('Identifies Python negative list indexing limitation in plain array mapping', async () => {
    // In Python, arr[-1] accesses the last element. In JS, arr[-1] returns undefined.
    const pythonCode = `nums = [10, 20, 30]\nprint(nums[-1])`;
    const res = await executeCodeSandbox(pythonCode, 'python');
    expect(res.stdout.trim()).toBe('undefined'); // In real Python, this would be 30.
  });

  it('Identifies C++ std::vector::push_back failure in raw JS array', async () => {
    // In real C++, push_back appends to vector. In JS, array only has push().
    const cppCode = `
#include <iostream>
#include <vector>
int main() {
    std::vector<int> v;
    v.push_back(100);
    return 0;
}`;
    const res = await executeCodeSandbox(cppCode, 'cpp');
    // JS throws TypeError: v.push_back is not a function
    expect(res.hasError).toBe(true);
    expect(res.errorMessage).toContain('push_back');
  });

  it('Identifies C/C++ struct and pointer limitations', async () => {
    // Real C++ linked list definition
    const cppLinkedList = `
struct ListNode {
    int val;
    ListNode* next;
};
int main() {
    ListNode* node = new ListNode{5, nullptr};
    return 0;
}`;
    const res = await executeCodeSandbox(cppLinkedList, 'cpp');
    expect(res.hasError).toBe(true); // Struct and new are unsupported by client regex transpiler
  });
});

describe('Audit: Infinite Loops, Recursion & Timeout Guard', () => {
  it('Timeout guard reliably interrupts standard while loop', async () => {
    const loopJs = `while(true) {}`;
    const res = await executeCodeSandbox(loopJs, 'javascript', '', 40);
    expect(res.hasError).toBe(true);
    expect(res.errorMessage).toContain('Time Limit Exceeded');
  });

  it('Timeout guard reliably interrupts standard for loop', async () => {
    const loopJs = `for(let i = 0; i >= 0; i++) {}`;
    const res = await executeCodeSandbox(loopJs, 'javascript', '', 40);
    expect(res.hasError).toBe(true);
    expect(res.errorMessage).toContain('Time Limit Exceeded');
  });

  it('Deep recursive nonterminating calls trigger call stack error rather than clean TLE', async () => {
    // Infinite recursion causes Call Stack Overflow before any loop guard ticks
    const infiniteRecursion = `
function recurse(n) {
    return recurse(n + 1);
}
recurse(0);
`;
    const res = await executeCodeSandbox(infiniteRecursion, 'javascript');
    expect(res.hasError).toBe(true);
    expect(res.errorMessage).toContain('Maximum call stack size exceeded');
  });
});

describe('Audit: Hidden Test Case Privacy & Bundle Security', () => {
  it('Masks hidden test cases in evaluation results sent to the UI', async () => {
    const spec = getDsaProblemSpec('two-sum');
    const allCases = [...spec.sampleCases, ...spec.hiddenCases];
    const summary = await evaluateTestCases('print("0 0")', 'python', allCases);

    const hiddenResults = summary.results.filter(r => r.isHidden);
    expect(hiddenResults.length).toBe(spec.hiddenCases.length);

    for (const h of hiddenResults) {
      expect(h.input).toBe('[Hidden Test Case]');
      expect(h.expectedOutput).toBe('[Hidden Expected Output]');
    }
  });

  it('Audits client bundle exposure: Hidden test cases are statically bundled in client bundle', () => {
    // Security audit finding: CURATED_DSA_PROBLEM_SPECS is bundled on the client side.
    // Any user with DevTools can inspect window or import.meta and view hiddenCases.
    const spec = CURATED_DSA_PROBLEM_SPECS['two-sum'];
    expect(spec.hiddenCases.length).toBeGreaterThan(0);
    expect(spec.hiddenCases[0].output).toBe('0 1');
    // This confirms hidden cases reside in client memory
  });
});

describe('Audit: Execution Adapters & Secure Backend Routing', () => {
  it('Defaults to ClientSandboxAdapter when no remote proxy is configured', async () => {
    const { getDefaultExecutionAdapter, ClientSandboxAdapter } = await import('../utils/codeRunner');
    const adapter = getDefaultExecutionAdapter();
    expect(adapter.name).toBe('client-sandbox');
    expect(adapter).toBeInstanceOf(ClientSandboxAdapter);
  });

  it('Judge0ProxyAdapter fails securely without fabricating results when proxy is unconfigured', async () => {
    const { Judge0ProxyAdapter } = await import('../utils/codeRunner');
    const unconfigured = new Judge0ProxyAdapter('');
    expect(unconfigured.isAvailable()).toBe(false);
    await expect(unconfigured.execute('console.log(1)', 'javascript')).rejects.toThrow(
      'Judge0 proxy service is not configured'
    );
  });
});
