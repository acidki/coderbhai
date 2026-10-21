import { describe, it, expect } from 'vitest';
import { CURATED_DSA_PROBLEM_SPECS } from '../data/dsaProblemSpecs';
import { INITIAL_QUESTION_BANK } from '../data/questionBank';
import { NEETCODE_PROBLEMS } from '../data/neetcodeProblems';
import timedTrainingSource from '../components/training/TimedTrainingSection.tsx?raw';
import codeZoneModalSource from '../components/codezone/CodeZoneModal.tsx?raw';

describe('Attempt-First Learning Experience & Solution Disclosure', () => {
  describe('Starter Templates Cleanliness (No Premature Solution Leak)', () => {
    it('CURATED_DSA_PROBLEM_SPECS starter templates provide clean boilerplate, not solved code', () => {
      for (const [id, spec] of Object.entries(CURATED_DSA_PROBLEM_SPECS)) {
        // Python starter template should have pass or return, but not solved algorithms
        const py = spec.starterTemplates.python;
        expect(py, `Problem ${id} Python starter template`).toBeDefined();
        expect(py).not.toMatch(/diff\s+in\s+seen/i);
        expect(py).not.toMatch(/s\[::-1\]/);
        expect(py).not.toMatch(/seen\s*=\s*set\(\)/);
        expect(py).not.toMatch(/nums\.sort\(\)/);

        // JavaScript starter template should not contain solved code
        const js = spec.starterTemplates.javascript;
        expect(js, `Problem ${id} JS starter template`).toBeDefined();
        expect(js).not.toMatch(/seen\.has\(/);
        expect(js).not.toMatch(/split\(''\)\.reverse\(\)/);

        // Spec should have solutions stored separately
        expect(spec.solutions, `Problem ${id} should have separate solutions object`).toBeDefined();
        expect(spec.solutions?.python).toBeTruthy();
        expect(spec.solutions?.javascript).toBeTruthy();
      }
    });

    it('INITIAL_QUESTION_BANK starter templates do not expose solutions', () => {
      for (const challenge of INITIAL_QUESTION_BANK) {
        if (!challenge.starterTemplates) continue;
        const py = challenge.starterTemplates.python || '';
        expect(py, `Challenge ${challenge.id} Python starter`).not.toMatch(/diff\s+in\s+seen/i);
        expect(py, `Challenge ${challenge.id} Python starter`).not.toMatch(/s\[::-1\]/);

        // Solutions exist separately
        expect(challenge.solutions, `Challenge ${challenge.id} should have solutions`).toBeDefined();
        expect(challenge.solutions?.python).toBeTruthy();
      }
    });

    it('NEETCODE_PROBLEMS starter templates do not expose solutions', () => {
      for (const challenge of NEETCODE_PROBLEMS) {
        if (!challenge.starterTemplates) continue;
        const py = challenge.starterTemplates.python || '';
        expect(py, `NeetCode ${challenge.id} Python starter`).not.toMatch(/seen\s*=\s*set\(\)/);
        expect(py, `NeetCode ${challenge.id} Python starter`).not.toMatch(/prices\[right\]\s*-\s*prices\[left\]/);

        // Solutions exist separately
        expect(challenge.solutions, `NeetCode ${challenge.id} should have solutions`).toBeDefined();
        expect(challenge.solutions?.python).toBeTruthy();
      }
    });
  });

  describe('Progressive Hints Data Presence', () => {
    it('CURATED_DSA_PROBLEM_SPECS all have progressive hints', () => {
      for (const [id, spec] of Object.entries(CURATED_DSA_PROBLEM_SPECS)) {
        expect(spec.hints, `Problem ${id} should have hints`).toBeDefined();
        expect(spec.hints!.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('INITIAL_QUESTION_BANK challenges have progressive hints', () => {
      for (const challenge of INITIAL_QUESTION_BANK) {
        expect(challenge.hints, `Challenge ${challenge.id} should have hints`).toBeDefined();
        expect(challenge.hints!.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('NEETCODE_PROBLEMS challenges have progressive hints', () => {
      for (const challenge of NEETCODE_PROBLEMS) {
        expect(challenge.hints, `NeetCode ${challenge.id} should have hints`).toBeDefined();
        expect(challenge.hints!.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('TimedTrainingSection UI Architecture Safeguards', () => {
    it('initializes solutions as hidden by default and hints as unrevealed', () => {
      expect(timedTrainingSource).toContain('const [revealedHintsCount, setRevealedHintsCount] = useState<number>(0);');
      expect(timedTrainingSource).toContain('const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);');
      expect(timedTrainingSource).toContain('const [showSolutionConfirm, setShowSolutionConfirm] = useState<boolean>(false);');
    });

    it('includes explicit confirmation step before revealing solution', () => {
      expect(timedTrainingSource).toContain('Reveal Reference Solution?');
      expect(timedTrainingSource).toContain('Keep Trying');
      expect(timedTrainingSource).toContain('Reveal Solution');
    });

    it('resets solution reveal and hints when switching activeProblem to prevent leakage', () => {
      expect(timedTrainingSource).toMatch(/activeProblem\?\.id/);
      expect(timedTrainingSource).toContain('setRevealedHintsCount(0)');
      expect(timedTrainingSource).toContain('setIsSolutionRevealed(false)');
      expect(timedTrainingSource).toContain('setShowSolutionConfirm(false)');
    });

    it('uses "Open Code Editor" instead of misleading "Code Solution" button', () => {
      expect(timedTrainingSource).toContain('Open Code Editor');
      expect(timedTrainingSource).not.toContain('<span>Code Solution</span>');
    });
  });

  describe('CodeZoneModal UI Architecture Safeguards', () => {
    it('initializes solutions as hidden by default and hints as unrevealed', () => {
      expect(codeZoneModalSource).toContain('const [revealedHintsCount, setRevealedHintsCount] = useState<number>(0);');
      expect(codeZoneModalSource).toContain('const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);');
      expect(codeZoneModalSource).toContain('const [showSolutionConfirm, setShowSolutionConfirm] = useState<boolean>(false);');
    });

    it('includes explicit confirmation step before revealing solution in CodeZone', () => {
      expect(codeZoneModalSource).toContain('Reveal Reference Solution?');
      expect(codeZoneModalSource).toContain('Keep Trying');
      expect(codeZoneModalSource).toContain('Reveal Solution');
    });

    it('resets solution reveal and hints when switching problem in CodeZone to prevent leakage', () => {
      expect(codeZoneModalSource).toMatch(/problem\?\.id/);
      expect(codeZoneModalSource).toContain('setRevealedHintsCount(0)');
      expect(codeZoneModalSource).toContain('setIsSolutionRevealed(false)');
      expect(codeZoneModalSource).toContain('setShowSolutionConfirm(false)');
    });

    it('provides Load into Editor and Copy options when solution is deliberately revealed', () => {
      expect(codeZoneModalSource).toContain('Load into Editor');
      expect(codeZoneModalSource).toContain('Copy solution code');
      expect(codeZoneModalSource).toContain('EyeOff');
    });
  });
});
