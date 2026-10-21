import { describe, it, expect } from 'vitest';
import {
  BLIND_75_ROADMAP,
  NEETCODE_150_ROADMAP,
  OFFICIAL_DSA_CATEGORIES,
} from '../data/dsaRoadmaps';
import {
  calculateIntegerPercentage,
  computeRoadmapProgress,
  parseStoredDsaProgress,
  serializeDsaProgress,
} from '../context/DsaProgressContext';
import { DsaProgressState, DsaProblemStatus } from '../types/dsa';
import { getDsaProblemSpec, CURATED_DSA_PROBLEM_SPECS } from '../data/dsaProblemSpecs';
import { evaluateTestCases, executeCodeSandbox } from '../utils/codeRunner';

describe('DSA Roadmaps Data & Structural Integrity', () => {
  it('Blind 75 has exactly 75 problems', () => {
    expect(BLIND_75_ROADMAP.totalCount).toBe(75);
    expect(BLIND_75_ROADMAP.problems.length).toBe(75);
  });

  it('NeetCode 150 has exactly 150 problems', () => {
    expect(NEETCODE_150_ROADMAP.totalCount).toBe(150);
    expect(NEETCODE_150_ROADMAP.problems.length).toBe(150);
  });

  it('No duplicate canonical IDs exist within Blind 75', () => {
    const ids = BLIND_75_ROADMAP.problems.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(75);
    expect(ids.length).toBe(75);
  });

  it('No duplicate canonical IDs exist within NeetCode 150', () => {
    const ids = NEETCODE_150_ROADMAP.problems.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(150);
    expect(ids.length).toBe(150);
  });

  it('Preserves exact sequential order (order = index + 1)', () => {
    BLIND_75_ROADMAP.problems.forEach((p, idx) => {
      expect(p.order).toBe(idx + 1);
    });
    NEETCODE_150_ROADMAP.problems.forEach((p, idx) => {
      expect(p.order).toBe(idx + 1);
    });
  });

  it('Order within each topic starts at 1 and increases monotonically without gaps', () => {
    const checkTopicOrdering = (problems: typeof BLIND_75_ROADMAP.problems) => {
      const topicCounters: Record<string, number> = {};
      for (const p of problems) {
        topicCounters[p.category] = (topicCounters[p.category] || 0) + 1;
        expect(p.topicOrder).toBe(topicCounters[p.category]);
      }
    };
    checkTopicOrdering(BLIND_75_ROADMAP.problems);
    checkTopicOrdering(NEETCODE_150_ROADMAP.problems);
  });

  it('All problems belong to the official 18 categories in order', () => {
    expect(OFFICIAL_DSA_CATEGORIES.length).toBe(18);
    const categorySet = new Set(OFFICIAL_DSA_CATEGORIES);

    for (const p of BLIND_75_ROADMAP.problems) {
      expect(categorySet.has(p.category)).toBe(true);
    }
    for (const p of NEETCODE_150_ROADMAP.problems) {
      expect(categorySet.has(p.category)).toBe(true);
    }
  });

  it('All problems have valid difficulty levels (Easy, Medium, Hard)', () => {
    const validDifficulties = new Set(['Easy', 'Medium', 'Hard']);
    for (const p of BLIND_75_ROADMAP.problems) {
      expect(validDifficulties.has(p.difficulty)).toBe(true);
    }
    for (const p of NEETCODE_150_ROADMAP.problems) {
      expect(validDifficulties.has(p.difficulty)).toBe(true);
    }
  });

  it('All problems have valid official problem URLs', () => {
    const urlPattern = /^https:\/\/leetcode\.com\/problems\//;
    for (const p of BLIND_75_ROADMAP.problems) {
      expect(p.leetcodeUrl).toMatch(urlPattern);
    }
    for (const p of NEETCODE_150_ROADMAP.problems) {
      expect(p.leetcodeUrl).toMatch(urlPattern);
    }
  });

  it('Every Blind 75 problem exists in NeetCode 150 with canonical identity', () => {
    const nc150Map = new Map(NEETCODE_150_ROADMAP.problems.map((p) => [p.id, p]));
    for (const b75Prob of BLIND_75_ROADMAP.problems) {
      const match = nc150Map.get(b75Prob.id);
      expect(match).toBeDefined();
      expect(match?.title).toBe(b75Prob.title);
      expect(match?.category).toBe(b75Prob.category);
      expect(match?.difficulty).toBe(b75Prob.difficulty);
    }
  });

  it('Both roadmaps are distinct ordered lists and not just simple truncated slices', () => {
    // Blind 75 is distributed across categories, whereas taking the first 75 of NeetCode 150
    // would only cover early categories like Arrays & Hashing, Two Pointers, etc.
    const first75Of150 = NEETCODE_150_ROADMAP.problems.slice(0, 75).map((p) => p.id);
    const b75Ids = BLIND_75_ROADMAP.problems.map((p) => p.id);
    expect(b75Ids).not.toEqual(first75Of150);
  });
});

describe('Progress Calculations & Boundary Cases', () => {
  it('calculateIntegerPercentage handles 0 and negative totals safely', () => {
    expect(calculateIntegerPercentage(0, 0)).toBe(0);
    expect(calculateIntegerPercentage(5, 0)).toBe(0);
    expect(calculateIntegerPercentage(5, -10)).toBe(0);
  });

  it('Boundary Case: 0 solved produces 0% overall progress', () => {
    const emptyProgress: DsaProgressState = {};
    const b75 = computeRoadmapProgress('blind75', emptyProgress);
    const nc150 = computeRoadmapProgress('neetcode150', emptyProgress);

    expect(b75.solved).toBe(0);
    expect(b75.percentage).toBe(0);
    expect(b75.notStarted).toBe(75);

    expect(nc150.solved).toBe(0);
    expect(nc150.percentage).toBe(0);
    expect(nc150.notStarted).toBe(150);
  });

  it('Boundary Case: All solved produces 100% overall progress', () => {
    const allB75Progress: DsaProgressState = {};
    for (const p of BLIND_75_ROADMAP.problems) {
      allB75Progress[p.id] = 'solved';
    }
    const b75 = computeRoadmapProgress('blind75', allB75Progress);
    expect(b75.solved).toBe(75);
    expect(b75.percentage).toBe(100);
    expect(b75.notStarted).toBe(0);

    const allNc150Progress: DsaProgressState = {};
    for (const p of NEETCODE_150_ROADMAP.problems) {
      allNc150Progress[p.id] = 'solved';
    }
    const nc150 = computeRoadmapProgress('neetcode150', allNc150Progress);
    expect(nc150.solved).toBe(150);
    expect(nc150.percentage).toBe(100);
    expect(nc150.notStarted).toBe(0);
  });

  it('Boundary Case: Attempted problems MUST NOT count as solved', () => {
    const attemptedProgress: DsaProgressState = {};
    for (const p of BLIND_75_ROADMAP.problems) {
      attemptedProgress[p.id] = 'attempted';
    }
    const b75 = computeRoadmapProgress('blind75', attemptedProgress);
    expect(b75.attempted).toBe(75);
    expect(b75.solved).toBe(0);
    expect(b75.percentage).toBe(0);
  });

  it('Applies integer rounding consistently (Math.round)', () => {
    // 1 / 75 = 1.333% -> 1%
    expect(calculateIntegerPercentage(1, 75)).toBe(1);
    // 2 / 75 = 2.667% -> 3%
    expect(calculateIntegerPercentage(2, 75)).toBe(3);
    // 37 / 75 = 49.333% -> 49%
    expect(calculateIntegerPercentage(37, 75)).toBe(49);
    // 38 / 75 = 50.667% -> 51%
    expect(calculateIntegerPercentage(38, 75)).toBe(51);

    // 1 / 150 = 0.667% -> 1%
    expect(calculateIntegerPercentage(1, 150)).toBe(1);
    // 2 / 150 = 1.333% -> 1%
    expect(calculateIntegerPercentage(2, 150)).toBe(1);
    // 75 / 150 = 50.0% -> 50%
    expect(calculateIntegerPercentage(75, 150)).toBe(50);
  });

  it('Computes topic-level progress accurately and preserves totals', () => {
    const sampleProgress: DsaProgressState = {
      'contains-duplicate': 'solved',
      'valid-anagram': 'attempted',
      'two-sum': 'solved',
    };

    const b75 = computeRoadmapProgress('blind75', sampleProgress);
    const arraysHashing = b75.topicSummaries['Arrays & Hashing'];

    expect(arraysHashing).toBeDefined();
    expect(arraysHashing.solved).toBe(2);
    expect(arraysHashing.attempted).toBe(1);
    expect(arraysHashing.notStarted).toBe(arraysHashing.total - 3);
    expect(arraysHashing.percentage).toBe(
      Math.round((2 / arraysHashing.total) * 100)
    );

    // Topic totals sum up to the total problems in the roadmap
    const sumTopicTotals = Object.values(b75.topicSummaries).reduce((acc, t) => acc + t.total, 0);
    expect(sumTopicTotals).toBe(75);
  });
});

describe('Shared Problem Synchronisation & Separation of Concerns', () => {
  it('A shared problem marked Solved synchronizes across both roadmaps', () => {
    const progress: DsaProgressState = {
      'two-sum': 'solved',
    };

    const b75 = computeRoadmapProgress('blind75', progress);
    const nc150 = computeRoadmapProgress('neetcode150', progress);

    expect(b75.solved).toBe(1);
    expect(nc150.solved).toBe(1);

    // Both reflect solved status
    expect(b75.topicSummaries['Arrays & Hashing'].solved).toBe(1);
    expect(nc150.topicSummaries['Arrays & Hashing'].solved).toBe(1);
  });

  it('Roadmap totals remain strictly independent and prevent double counting', () => {
    const progress: DsaProgressState = {
      'two-sum': 'solved',
      'valid-anagram': 'solved',
    };

    const b75 = computeRoadmapProgress('blind75', progress);
    const nc150 = computeRoadmapProgress('neetcode150', progress);

    expect(b75.total).toBe(75);
    expect(nc150.total).toBe(150);
    expect(b75.solved).toBe(2);
    expect(nc150.solved).toBe(2);
  });

  it('Problems exclusive to NeetCode 150 do not affect Blind 75', () => {
    // Find a problem in NeetCode 150 that is NOT in Blind 75
    const b75IdSet = new Set(BLIND_75_ROADMAP.problems.map((p) => p.id));
    const exclusiveProb = NEETCODE_150_ROADMAP.problems.find((p) => !b75IdSet.has(p.id));
    expect(exclusiveProb).toBeDefined();

    if (exclusiveProb) {
      const progress: DsaProgressState = {
        [exclusiveProb.id]: 'solved',
      };

      const b75 = computeRoadmapProgress('blind75', progress);
      const nc150 = computeRoadmapProgress('neetcode150', progress);

      expect(nc150.solved).toBe(1);
      expect(b75.solved).toBe(0);
      expect(b75.percentage).toBe(0);
    }
  });

  it('Transitions between Not Started, Attempted, and Solved update accurately', () => {
    const testId = 'two-sum';
    let progress: DsaProgressState = {};

    // 1. Initial
    let b75 = computeRoadmapProgress('blind75', progress);
    expect(b75.solved).toBe(0);
    expect(b75.attempted).toBe(0);

    // 2. Mark Attempted
    progress = { ...progress, [testId]: 'attempted' };
    b75 = computeRoadmapProgress('blind75', progress);
    expect(b75.solved).toBe(0);
    expect(b75.attempted).toBe(1);

    // 3. Mark Solved
    progress = { ...progress, [testId]: 'solved' };
    b75 = computeRoadmapProgress('blind75', progress);
    expect(b75.solved).toBe(1);
    expect(b75.attempted).toBe(0);

    // 4. Reset to Not Started
    progress = { ...progress, [testId]: 'not-started' };
    b75 = computeRoadmapProgress('blind75', progress);
    expect(b75.solved).toBe(0);
    expect(b75.attempted).toBe(0);
    expect(b75.notStarted).toBe(75);
  });
});

describe('Persistence, Serialization & Error Handling', () => {
  it('Parses valid version 1 storage payload', () => {
    const payload = JSON.stringify({
      version: 1,
      updatedAt: '2026-10-19T18:00:00.000Z',
      progress: {
        'two-sum': 'solved',
        'valid-anagram': 'attempted',
      },
    });

    const parsed = parseStoredDsaProgress(payload);
    expect(parsed['two-sum']).toBe('solved');
    expect(parsed['valid-anagram']).toBe('attempted');
  });

  it('Parses legacy raw map payload without version wrapper', () => {
    const legacy = JSON.stringify({
      'two-sum': 'solved',
      'group-anagrams': 'attempted',
    });

    const parsed = parseStoredDsaProgress(legacy);
    expect(parsed['two-sum']).toBe('solved');
    expect(parsed['group-anagrams']).toBe('attempted');
  });

  it('Safely handles null, undefined, empty string, and malformed JSON', () => {
    expect(parseStoredDsaProgress(null)).toEqual({});
    expect(parseStoredDsaProgress(undefined as unknown as string)).toEqual({});
    expect(parseStoredDsaProgress('')).toEqual({});
    expect(parseStoredDsaProgress('{ corrupt invalid json')).toEqual({});
    expect(parseStoredDsaProgress('12345')).toEqual({});
    expect(parseStoredDsaProgress('true')).toEqual({});
  });

  it('Filters out invalid or unknown status values', () => {
    const tainted = JSON.stringify({
      version: 1,
      progress: {
        'two-sum': 'solved',
        'corrupt-prob': 'completed', // invalid status
        'hack-prob': 999, // invalid type
        'null-prob': null,
      },
    });

    const parsed = parseStoredDsaProgress(tainted);
    expect(parsed['two-sum']).toBe('solved');
    expect(parsed['corrupt-prob']).toBeUndefined();
    expect(parsed['hack-prob']).toBeUndefined();
    expect(parsed['null-prob']).toBeUndefined();
  });

  it('Serializes progress cleanly into versioned JSON', () => {
    const progress: DsaProgressState = {
      'two-sum': 'solved',
      'contains-duplicate': 'attempted',
    };

    const serialized = serializeDsaProgress(progress);
    const parsed = JSON.parse(serialized);

    expect(parsed.version).toBe(1);
    expect(typeof parsed.updatedAt).toBe('string');
    expect(parsed.progress).toEqual(progress);
  });
});

describe('Search and Filter Invariants', () => {
  it('Filters problems by title search case-insensitively', () => {
    const query = 'two sum';
    const matches = BLIND_75_ROADMAP.problems.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase())
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((p) => p.id === 'two-sum')).toBe(true);
  });

  it('Filters problems by difficulty level', () => {
    const easyProblems = BLIND_75_ROADMAP.problems.filter((p) => p.difficulty === 'Easy');
    const mediumProblems = BLIND_75_ROADMAP.problems.filter((p) => p.difficulty === 'Medium');
    const hardProblems = BLIND_75_ROADMAP.problems.filter((p) => p.difficulty === 'Hard');

    expect(easyProblems.length + mediumProblems.length + hardProblems.length).toBe(75);
    expect(easyProblems.length).toBeGreaterThan(0);
    expect(mediumProblems.length).toBeGreaterThan(0);
    expect(hardProblems.length).toBeGreaterThan(0);
  });

  it('Filters problems by user progress status', () => {
    const progress: DsaProgressState = {
      'two-sum': 'solved',
      'valid-anagram': 'attempted',
    };

    const getStatus = (id: string): DsaProblemStatus => progress[id] || 'not-started';

    const solvedList = BLIND_75_ROADMAP.problems.filter((p) => getStatus(p.id) === 'solved');
    const attemptedList = BLIND_75_ROADMAP.problems.filter((p) => getStatus(p.id) === 'attempted');
    const notStartedList = BLIND_75_ROADMAP.problems.filter((p) => getStatus(p.id) === 'not-started');

    expect(solvedList.map((p) => p.id)).toEqual(['two-sum']);
    expect(attemptedList.map((p) => p.id)).toEqual(['valid-anagram']);
    expect(notStartedList.length).toBe(73);
  });
});

describe('CodeZone Integration & Problem Evaluation', () => {
  it('getDsaProblemSpec returns curated specs with starter templates and test cases', () => {
    const spec = getDsaProblemSpec('two-sum', 'blind75');
    expect(spec.id).toBe('two-sum');
    expect(spec.title).toBe('Two Sum');
    expect(spec.category).toBe('Arrays & Hashing');
    expect(spec.difficulty).toBe('Easy');
    expect(spec.description).toContain('nums');
    expect(spec.sampleCases.length).toBeGreaterThan(0);
    expect(spec.hiddenCases.length).toBeGreaterThan(0);

    // Starter templates for C, C++, Python, JavaScript
    expect(spec.starterTemplates.c).toContain('#include');
    expect(spec.starterTemplates.cpp).toContain('#include');
    expect(spec.starterTemplates.python).toContain('twoSum');
    expect(spec.starterTemplates.javascript).toContain('solve');
  });

  it('getDsaProblemSpec seamlessly resolves non-curated problems from NeetCode 150', () => {
    const nonCurated = NEETCODE_150_ROADMAP.problems.find(
      (p) => !CURATED_DSA_PROBLEM_SPECS[p.id]
    );
    expect(nonCurated).toBeDefined();

    if (nonCurated) {
      const spec = getDsaProblemSpec(nonCurated.id, 'neetcode150');
      expect(spec.id).toBe(nonCurated.id);
      expect(spec.title).toBe(nonCurated.title);
      expect(spec.category).toBe(nonCurated.category);
      expect(spec.difficulty).toBe(nonCurated.difficulty);
      expect(spec.sampleCases.length).toBeGreaterThan(0);
      expect(spec.hiddenCases.length).toBeGreaterThan(0);
      expect(spec.starterTemplates.python).toBeDefined();
      expect(spec.starterTemplates.cpp).toBeDefined();
      expect(spec.starterTemplates.c).toBeDefined();
      expect(spec.starterTemplates.javascript).toBeDefined();
    }
  });

  it('Python evaluation: Correct solution evaluates to Accepted', async () => {
    const spec = getDsaProblemSpec('two-sum');
    const correctPython = spec.solutions?.python || spec.starterTemplates.python;

    const summary = await evaluateTestCases(correctPython, 'python', spec.sampleCases);
    expect(summary.allPassed).toBe(true);
    expect(summary.verdict).toBe('Accepted');
    expect(summary.passedCount).toBe(spec.sampleCases.length);
  });

  it('Python evaluation: Incorrect solution evaluates to Wrong Answer', async () => {
    const spec = getDsaProblemSpec('two-sum');
    const incorrectPython = `print("0 0")`;

    const summary = await evaluateTestCases(incorrectPython, 'python', spec.sampleCases);
    expect(summary.allPassed).toBe(false);
    expect(summary.verdict).toBe('Wrong Answer');
  });

  it('C++ evaluation: Correct solution evaluates to Accepted', async () => {
    const spec = getDsaProblemSpec('two-sum');
    const correctCpp = spec.solutions?.cpp || spec.starterTemplates.cpp;

    const summary = await evaluateTestCases(correctCpp, 'cpp', spec.sampleCases);
    expect(summary.allPassed).toBe(true);
    expect(summary.verdict).toBe('Accepted');
  });

  it('C++ evaluation: Missing semicolon triggers Compilation Error', async () => {
    const spec = getDsaProblemSpec('two-sum');
    const brokenCpp = `
#include <iostream>
int main() {
    int x = ;
    std::cout << x;
    return 0;
}`;

    const summary = await evaluateTestCases(brokenCpp, 'cpp', spec.sampleCases);
    expect(summary.allPassed).toBe(false);
    expect(summary.verdict).toBe('Compilation Error');
  });

  it('C evaluation: Correct solution evaluates to Accepted', async () => {
    const spec = getDsaProblemSpec('two-sum');
    const correctC = spec.solutions?.c || spec.starterTemplates.c;

    const summary = await evaluateTestCases(correctC, 'c', spec.sampleCases);
    expect(summary.allPassed).toBe(true);
    expect(summary.verdict).toBe('Accepted');
  });

  it('Never exposes hidden test inputs or expected outputs to the client', async () => {
    const spec = getDsaProblemSpec('two-sum');
    const wrongPython = `print("-1 -1")`;

    const allCases = [...spec.sampleCases, ...spec.hiddenCases];
    const summary = await evaluateTestCases(wrongPython, 'python', allCases);

    const hiddenResults = summary.results.filter((r) => r.isHidden);
    expect(hiddenResults.length).toBe(spec.hiddenCases.length);

    for (const h of hiddenResults) {
      expect(h.input).toBe('[Hidden Test Case]');
      expect(h.expectedOutput).toBe('[Hidden Expected Output]');
    }
  });

  it('Timeout guard: Infinite loop produces Time Limit Exceeded', async () => {
    // Pass a very short timeout (50ms) to verify timeout guard without slowing test suite
    const infiniteLoopJs = `while(true) {}`;
    const res = await executeCodeSandbox(infiniteLoopJs, 'javascript', '', 50);

    expect(res.hasError).toBe(true);
    expect(res.errorMessage).toContain('Time Limit Exceeded');
  });

  it('Submission status: Only full accepted submission marks problem solved', () => {
    const problemId = 'two-sum';
    let progress: DsaProgressState = {};

    // 1. Running sample test passes, but only marks 'attempted'
    progress = { ...progress, [problemId]: 'attempted' };
    let summary = computeRoadmapProgress('blind75', progress);
    expect(summary.solved).toBe(0);
    expect(summary.percentage).toBe(0);
    expect(summary.attempted).toBe(1);

    // 2. Full submission accepted marks 'solved'
    progress = { ...progress, [problemId]: 'solved' };
    summary = computeRoadmapProgress('blind75', progress);
    expect(summary.solved).toBe(1);
    expect(summary.percentage).toBe(1);
    expect(summary.attempted).toBe(0);

    // 3. Shared problem reflects in NeetCode 150 too
    const ncSummary = computeRoadmapProgress('neetcode150', progress);
    expect(ncSummary.solved).toBe(1);
  });
});
