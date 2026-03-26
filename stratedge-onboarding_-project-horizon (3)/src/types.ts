
export enum Competency {
  AutonomyOwnership = "Autonomy & Ownership",
  TruthOverHierarchy = "Truth Over Hierarchy",
  ComplianceMindset = "Compliance Mindset",
  PostMortemThinking = "Post-Mortem Thinking"
}

export enum Verdict {
  Excellent = "Excellent",
  Good = "Good",
  NeedsImprovement = "Needs Improvement",
  Poor = "Poor"
}

export interface Choice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  scenario: string;
  imageUrl?: string;
  choices: Choice[];
}

export interface QuizAnswer {
  questionId: number;
  choiceId: string;
  textAnswer?: string;
}

export interface PerformanceReview {
  overallScore: number;
  breakdown: {
    initiative: number;
    ownership: number;
    decisionMaking: number;
  };
  verdict: Verdict;
  strengths: string[];
  improvements: string[];
  xpAwarded: number;
  badgeUnlocked?: string;
}

export interface Character {
  name: string;
  role: string;
  description: string;
  imageUrl?: string;
}

export interface GameState {
  currentStep: 'welcome' | 'team_intro' | 'chapter_intro' | 'video' | 'quiz' | 'review' | 'summary';
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  totalXP: number;
  level: number;
  badges: string[];
  review: PerformanceReview | null;
}
