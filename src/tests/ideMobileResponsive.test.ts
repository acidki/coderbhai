import { describe, it, expect } from 'vitest';
import codeZoneModalContent from '../components/codezone/CodeZoneModal.tsx?raw';
import codingArenaModalContent from '../components/arena/CodingArenaModal.tsx?raw';
import dsaRoadmapModalContent from '../components/dsa/DsaRoadmapModal.tsx?raw';

describe('IDE and Mobile UI Responsiveness Contracts', () => {
  describe('CodeZoneModal Mobile UI Responsiveness', () => {
    it('uses dynamic viewport height and safe-area insets without fixed height clipping', () => {
      expect(codeZoneModalContent).toContain('100dvh');
      expect(codeZoneModalContent).toContain('env(safe-area-inset-top)');
      expect(codeZoneModalContent).toContain('env(safe-area-inset-bottom)');
    });

    it('provides a mobile segmented workspace switcher for Problem, Code, and Tests hidden on desktop', () => {
      expect(codeZoneModalContent).toContain('flex md:hidden items-center border-b');
      expect(codeZoneModalContent).toContain("setMobileTab('problem')");
      expect(codeZoneModalContent).toContain("setMobileTab('code')");
      expect(codeZoneModalContent).toContain("setMobileTab('tests')");
    });

    it('confines editor text without wrapping and prevents mobile viewport bounce', () => {
      expect(codeZoneModalContent).toContain('wrap="off"');
      expect(codeZoneModalContent).toContain('overscroll-contain');
    });

    it('wraps long test results with break-all and whitespace-pre-wrap', () => {
      expect(codeZoneModalContent).toContain('break-all whitespace-pre-wrap');
    });

    it('provides compact back button and responsive title to prevent top-bar overflow', () => {
      expect(codeZoneModalContent).toContain('truncate max-w-[120px] xs:max-w-[180px]');
      expect(codeZoneModalContent).toContain('hidden sm:inline');
    });
  });

  describe('CodingArenaModal Mobile UI Responsiveness', () => {
    it('uses dynamic viewport height and safe-area insets for 1v1 duel arena', () => {
      expect(codingArenaModalContent).toContain('100dvh');
      expect(codingArenaModalContent).toContain('env(safe-area-inset-top)');
      expect(codingArenaModalContent).toContain('env(safe-area-inset-bottom)');
    });

    it('provides a mobile segmented workspace switcher for live duels hidden on desktop', () => {
      expect(codingArenaModalContent).toContain('flex md:hidden items-center border-b');
      expect(codingArenaModalContent).toContain("setMobileBattleTab('problem')");
      expect(codingArenaModalContent).toContain("setMobileBattleTab('code')");
      expect(codingArenaModalContent).toContain("setMobileBattleTab('tests')");
    });

    it('confines code editor scrolling and prevents page bounce in duel arena', () => {
      expect(codingArenaModalContent).toContain('wrap="off"');
      expect(codingArenaModalContent).toContain('overscroll-contain');
    });
  });

  describe('DsaRoadmapModal Mobile UI Responsiveness', () => {
    it('uses dynamic viewport height and safe-area insets on mobile screens', () => {
      expect(dsaRoadmapModalContent).toContain('100dvh');
      expect(dsaRoadmapModalContent).toContain('env(safe-area-inset-top)');
      expect(dsaRoadmapModalContent).toContain('env(safe-area-inset-bottom)');
    });
  });
});
