import { CodeLanguage, TestCase } from './index';

export type DsaProblemStatus = 'not-started' | 'attempted' | 'solved';

export type DsaProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export type DsaRoadmapId = 'blind75' | 'neetcode150';

export interface DsaProblem {
  id: string; // Canonical LeetCode slug (e.g., "two-sum", "contains-duplicate")
  title: string; // Exact problem title (e.g., "Two Sum")
  category: string; // Official topic (e.g., "Arrays & Hashing")
  difficulty: DsaProblemDifficulty;
  order: number; // 1-indexed sequential position in this roadmap
  topicOrder: number; // 1-indexed position within its category in this roadmap
  leetcodeUrl: string; // Official LeetCode URL
  neetcodeUrl?: string; // Official NeetCode problem URL
  roadmaps: DsaRoadmapId[]; // Membership
}

export interface DsaExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface DsaProblemSpec {
  id: string; // Canonical LeetCode slug (e.g. "two-sum")
  title: string;
  category: string;
  difficulty: DsaProblemDifficulty;
  description: string;
  examples: DsaExample[];
  constraints: string[];
  sampleCases: TestCase[];
  hiddenCases: TestCase[];
  starterTemplates: Record<CodeLanguage, string>;
  solutions?: Partial<Record<CodeLanguage, string>>;
  hints?: string[];
  roadmapId?: DsaRoadmapId;
}

export type SubmissionVerdict =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Compilation Error'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Infrastructure Error';

export interface DsaEvaluationResult {
  verdict: SubmissionVerdict;
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  isSubmission: boolean; // true = submit against hidden tests; false = run code against sample tests
  totalTimeMs: number;
  firstFailedIndex?: number;
  errorMessage?: string;
}

export interface DsaRoadmap {
  id: DsaRoadmapId;
  title: string;
  shortTitle: string;
  description: string;
  badge: string;
  totalCount: number;
  categories: string[];
  problems: DsaProblem[];
}

export type DsaProgressState = Record<string, DsaProblemStatus>;

export interface TopicProgressSummary {
  category: string;
  total: number;
  solved: number;
  attempted: number;
  notStarted: number;
  percentage: number;
}

export interface RoadmapProgressSummary {
  roadmapId: DsaRoadmapId;
  total: number;
  solved: number;
  attempted: number;
  notStarted: number;
  percentage: number;
  topicSummaries: Record<string, TopicProgressSummary>;
}
