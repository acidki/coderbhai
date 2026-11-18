# Codebase Audit Summary

---

### 1. Full Directory Tree (excluding `node_modules` and `.git`)

```
.
├── audit.md
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── public/
│   ├── _redirects
│   ├── favicon.svg
│   └── icons.svg
├── README.md
├── scripts/
│   └── validate-roadmaps.js
├── skills-lock.json
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── arena/
│   │   │   ├── CodingArenaModal.tsx
│   │   │   └── QuestionBankModal.tsx
│   │   ├── auth/
│   │   │   └── AuthModal.tsx
│   │   ├── chat/
│   │   │   └── MessagingModal.tsx
│   │   ├── codezone/
│   │   │   └── CodeZoneModal.tsx
│   │   ├── common/
│   │   │   ├── CatFace.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FriendRequestNotificationToast.tsx
│   │   │   └── TTSButton.tsx
│   │   ├── companion/
│   │   │   └── BhaiCompanion.tsx
│   │   ├── dsa/
│   │   │   ├── DsaRoadmapModal.tsx
│   │   │   └── DsaRoadmapsSection.tsx
│   │   ├── ideazone/
│   │   │   └── IdeaZoneModal.tsx
│   │   ├── lesson/
│   │   │   ├── CharacterIntroModal.tsx
│   │   │   ├── ConceptGuideModal.tsx
│   │   │   ├── ConceptMatch.tsx
│   │   │   ├── FeedbackBanner.tsx
│   │   │   ├── LessonCompleteModal.tsx
│   │   │   ├── LessonModal.tsx
│   │   │   ├── OutOfHeartsModal.tsx
│   │   │   ├── PredictOutput.tsx
│   │   │   ├── SpotTheBug.tsx
│   │   │   └── TapToFill.tsx
│   │   ├── navigation/
│   │   │   ├── BottomNavBar.tsx
│   │   │   ├── MoreDrawerModal.tsx
│   │   │   └── TopBar.tsx
│   │   ├── onboarding/
│   │   │   └── ByteOnboardingModal.tsx
│   │   ├── path/
│   │   │   ├── ByteCampfire.tsx
│   │   │   ├── UnitGuidebookModal.tsx
│   │   │   └── WindingPath.tsx
│   │   ├── placement/
│   │   │   └── PlacementModal.tsx
│   │   ├── practice/
│   │   │   └── PracticeModal.tsx
│   │   ├── profile/
│   │   │   └── UserProfileInspectModal.tsx
│   │   ├── settings/
│   │   │   └── ThemeCustomizerModal.tsx
│   │   ├── sidebar/
│   │   │   ├── LeftSidebar.tsx
│   │   │   └── RightSidebar.tsx
│   │   ├── speed-training/
│   │   │   ├── SpeedTrainingModal.tsx
│   │   │   └── SpeedTrainingSidebarSection.tsx
│   │   └── training/
│   │       ├── TimedTrainingSection.tsx
│   │       └── TrainingModal.tsx
│   ├── context/
│   │   ├── DsaProgressContext.tsx
│   │   └── GameContext.tsx
│   ├── data/
│   │   ├── characters.ts
│   │   ├── courses.ts
│   │   ├── dsaProblemSpecs.ts
│   │   ├── dsaRoadmaps.ts
│   │   ├── neetcodeProblems.ts
│   │   ├── questionBank.ts
│   │   └── translations.ts
│   ├── index.css
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── supabaseClient.ts
│   ├── main.tsx
│   ├── services/
│   │   ├── arenaService.ts
│   │   ├── authService.ts
│   │   └── trainingService.ts
│   ├── tests/
│   │   ├── attemptFirstExperience.test.ts
│   │   ├── dsaAuditEdgeCases.test.ts
│   │   ├── dsaRoadmaps.test.ts
│   │   ├── ideMobileResponsive.test.ts
│   │   ├── speedTrainingHub.test.ts
│   │   ├── timedTrainingExecution.test.ts
│   │   ├── timedTrainingResponsive.test.ts
│   │   └── unifiedSpeedTraining.test.ts
│   ├── types/
│   │   ├── dsa.ts
│   │   └── index.ts
│   └── utils/
│       ├── audio.ts
│       ├── codeRunner.ts
│       ├── confetti.ts
│       ├── lessonTranslator.ts
│       └── tts.ts
├── supabase_schema.sql
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

---

### 2. Exact Contents of `package.json`

From [package.json](file:///home/Greninja006/Projects/coderbhai/package.json):

```json
{
  "name": "bytesized",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host --force",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "test": "vitest run",
    "validate:roadmaps": "node scripts/validate-roadmaps.js",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.118.0",
    "canvas-confetti": "^1.9.4",
    "lucide-react": "^1.57.0",
    "prismjs": "^1.30.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^24.13.3",
    "@types/prismjs": "^1.26.6",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "autoprefixer": "^10.6.1",
    "oxlint": "^1.81.0",
    "postcss": "^8.5.30",
    "tailwindcss": "^3.4.19",
    "typescript": "~6.0.2",
    "vite": "^8.3.0",
    "vitest": "^5.0.5"
  }
}
```

---

### 3. How Lessons & Exercises Are Structured and Stored

#### Hierarchy and Schema
- Defined in [index.ts](file:///home/Greninja006/Projects/coderbhai/src/types/index.ts):
  - **`Course`**: Top-level course (`id: 'c' | 'cpp' | 'python' | 'oop' | 'dsa' | 'algorithms'`), containing `units` and `placementQuestions`.
  - **`Unit`**: Course unit with `unitNumber`, title, banner colors, and an array of `LessonNode` objects (`nodes`).
  - **`LessonNode`**: Individual curriculum milestone containing `id`, `unitId`, `title`, `description`, optional `teachingIntro` (character dialogue & interactive anatomy), and `questions: Question[]`.
  - **`Question`**: Discriminated union of 4 interactive types:
    - `tap-to-fill`: Code with `blanks` (`{ id, correctValue }`) and an option bank.
    - `spot-the-bug`: Array of `codeLines` with `bugLineIndex` and `bugExplanation`.
    - `predict-output`: `codeSnippet` with multiple-choice `options` (`{ id, text, isCorrect }`).
    - `concept-match`: Term-to-definition mapping `pairs` (`{ id, term, definition }`).
- **Storage Location**: Static TypeScript configuration in [courses.ts](file:///home/Greninja006/Projects/coderbhai/src/data/courses.ts) under the exported record `COURSES: Record<CourseId, Course>`, accompanied by localization utilities in [lessonTranslator.ts](file:///home/Greninja006/Projects/coderbhai/src/utils/lessonTranslator.ts).

#### Sample `LessonNode` Object
Below is an authentic sample `LessonNode` (`c-u1-n1`) from [courses.ts](file:///home/Greninja006/Projects/coderbhai/src/data/courses.ts#L158-L270):

```json
{
  "id": "c-u1-n1",
  "unitId": "c-u1",
  "title": "Hello C & printf",
  "description": "Learn why C uses stdio.h and printf instead of std::cout",
  "iconType": "terminal",
  "teachingIntro": {
    "title": "Your First C Program: printf & stdio.h",
    "subtitle": "Lin 🕶️ & Junior 🧢 introduce the mother of modern languages",
    "characterId": "lin",
    "steps": [
      {
        "characterId": "lin",
        "characterMood": "teaching",
        "speech": "Welcome to Pure C! 🕶️ In C, there are no classes, no namespaces, and no 'std::cout'.\n\nC is direct and blazing fast. Operating system kernels like Linux and Windows are written in C! To print to the screen, we include <stdio.h> (Standard Input/Output) and use the printf() function.",
        "codeSnippet": "#include <stdio.h>\n\nint main(void) {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}"
      },
      {
        "characterId": "junior",
        "characterMood": "thinking",
        "speech": "Wait Lin! 🧢 What is \\n and why does main return 0?",
        "anatomy": [
          { "token": "#include <stdio.h>", "explanation": "Loads standard C I/O tools (printf, scanf)." },
          { "token": "printf(\"...\")", "explanation": "Prints formatted text to your terminal screen." },
          { "token": "\\n", "explanation": "Newline character. Moves the cursor down to the next line." },
          { "token": "return 0;", "explanation": "Tells the operating system the program executed successfully with 0 errors." }
        ],
        "interactiveTry": {
          "prompt": "Assemble your first pure C program statement to print Hello C!",
          "tokens": ["printf(", "\"Hello C!\\n\"", ");", "std::cout", "<<"],
          "targetOrder": ["printf(", "\"Hello C!\\n\"", ");"],
          "previewOutput": "Hello C!\n"
        }
      },
      {
        "characterId": "lin",
        "characterMood": "cheering",
        "speech": "Awesome! 🎉 Notice the semicolon (;) at the end of every statement. In C, missing a semicolon breaks the whole compilation!"
      }
    ]
  },
  "questions": [
    {
      "id": "c-1-1-1",
      "type": "tap-to-fill",
      "prompt": "Fill in the basic C hello world program structure:",
      "explanation": "stdio.h provides printf, and return 0 signals successful completion to the operating system.",
      "xpReward": 10,
      "mentorTip": "stdio.h is Standard Input Output!",
      "codeTemplate": "#include <{{blank1}}>\nint main(void) {\n    printf(\"Hello, World!\\n\");\n    return {{blank2}};\n}",
      "options": ["stdio.h", "iostream", "0", "1", "void"],
      "blanks": [
        { "id": "blank1", "correctValue": "stdio.h" },
        { "id": "blank2", "correctValue": "0" }
      ]
    }
  ]
}
```

---

### 4. How User Answers, Errors, and State Are Handled

Managed centrally in [LessonModal.tsx](file:///home/Greninja006/Projects/coderbhai/src/components/lesson/LessonModal.tsx) and [GameContext.tsx](file:///home/Greninja006/Projects/coderbhai/src/context/GameContext.tsx):

1. **Queue & Input State**:
   - `questionQueue`: Dynamic array initialized with `[...node.questions]`.
   - `currentQueueIndex`: Tracks current active question.
   - Input states per question type:
     - `tapAnswers`: `Record<string, string>` (blank ID $\rightarrow$ chosen value).
     - `selectedBugLine`: `number | null` (line clicked in `SpotTheBug`).
     - `selectedOutputOption`: `string | null` (option ID chosen in `PredictOutput`).
     - `isConceptAllMatched`: `boolean` (all pairs connected in `ConceptMatch`).
2. **Answer Verification**:
   - `canCheckAnswer()` validates all inputs are populated.
   - `handleCheckAnswer()` evaluates user input against the expected solution (`blanks.every(...)`, `selectedBugLine === q.bugLineIndex`, or option `isCorrect`).
3. **Success Flow**:
   - Plays audio (`sound.playSuccess()`, `sound.playCombo()`), increments `comboCount`, triggers `fireSmallBurst()` confetti on combo $\ge 2$, and increments `earnedXpTotal`.
   - Adds question ID to `completedUniqueIds`.
4. **Error & Mistake Handling**:
   - Plays `sound.playError()`, resets `comboCount = 0`, sets `catMood = 'comforting'`.
   - Calls `deductHeart()` from `useGame()` (respects admin role and `.edu` unlimited hearts perks; if remaining hearts reach 0, launches `<OutOfHeartsModal />`).
   - Calls `addMistake(currentQuestion)` in [GameContext.tsx](file:///home/Greninja006/Projects/coderbhai/src/context/GameContext.tsx#L430-L438) to persist the question to global review storage (`state.mistakes`).
   - Tracks question in `firstAttemptMistakes` set for calculating lesson accuracy.
   - **Adaptive Spaced Repetition**: Appends the missed question to the end of `questionQueue` (`setQuestionQueue(prev => [...prev, currentQuestion])`) so the user must re-attempt and solve it before completing the lesson.
5. **Feedback & Progression**:
   - Sets `isAnswerSubmitted = true`, mounting [FeedbackBanner.tsx](file:///home/Greninja006/Projects/coderbhai/src/components/lesson/FeedbackBanner.tsx) at the bottom screen edge with status, explanation, and a "Continue" button.
   - Clicking Continue invokes `handleContinueAfterFeedback()`, clearing input states and moving to `currentQueueIndex + 1` or invoking `completeNodeLesson()` when the queue is finished.

---

### 5. Where an AI "Explain Mistake" Button and Chat Drawer Should Hook In

#### A. Trigger Button Insertion: [FeedbackBanner.tsx](file:///home/Greninja006/Projects/coderbhai/src/components/lesson/FeedbackBanner.tsx)
- **Exact Location**: In [FeedbackBanner.tsx#L47-L77](file:///home/Greninja006/Projects/coderbhai/src/components/lesson/FeedbackBanner.tsx#L47-L77), when `!isCorrect`.
- **UI Placement**: Next to `<TTSButton />` or directly underneath the error explanation `<p>{explanation}</p>`, or as a secondary action button beside the chunky `Continue` button.
- **Contract Addition**:
  ```tsx
  interface Props {
    isCorrect: boolean;
    explanation: string;
    xpEarned: number;
    onContinue: () => void;
    onExplainMistake?: () => void; // <-- AI trigger callback
  }
  ```
- **Secondary Placement**: Inside the top mentor bar of [LessonModal.tsx#L330-L376](file:///home/Greninja006/Projects/coderbhai/src/components/lesson/LessonModal.tsx#L330-L376) next to `bhaiHint` and `conceptGuide`.

#### B. AI Chat Drawer Hook: [LessonModal.tsx](file:///home/Greninja006/Projects/coderbhai/src/components/lesson/LessonModal.tsx)
- **Component Placement**: Rendered inside [LessonModal.tsx](file:///home/Greninja006/Projects/coderbhai/src/components/lesson/LessonModal.tsx) right before the closing `</div>` (line 572).
- **State Needed**:
  ```tsx
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  ```
- **Context to pass into the AI Drawer Component**:
  - `question`: Current `currentQuestion` (`prompt`, `explanation`, `type`, `mentorTip`).
  - `codeContext`: Snippet, lines, or template depending on question type (`q.codeSnippet`, `q.codeLines`, `q.codeTemplate`).
  - `userAnswer`: The user's exact wrong input (`tapAnswers`, `selectedBugLine`, `selectedOutputOption`).
  - `courseId` & `language`: `currentCourse.id` (e.g. `'c'`, `'cpp'`) and `state.language` (`'en'` or `'bn'`).
- **Advantage of placing inside `LessonModal`**: Keeps the lesson active and paused in memory without unmounting the modal or resetting `questionQueue`, allowing the user to read the AI breakdown, close the drawer, and continue the lesson seamlessly.
