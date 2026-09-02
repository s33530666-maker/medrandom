export type CategoryType =
  | 'Anatomy'
  | 'Physiology'
  | 'Pathology'
  | 'Pharmacology'
  | 'Microbiology'
  | 'Clinical Cases'
  | 'Clinical Nutrition'
  | 'Public Health'
  | 'Research & EBM';

export type DifficultyType = 'easy' | 'medium' | 'hard';

export interface Topic {
  id: number;
  title: string;
  category: CategoryType;
  difficulty: DifficultyType;
  description: string | null;
  createdAt: string;
}

export interface Attempt {
  id: number;
  topicId: number;
  topic: Topic;
  startedAt: string;
  researchSecs: number | null;
  explainSecs: number | null;
  notes: string | null;
  completed: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  topicsCompletedToday: number;
  totalCompleted: number;
  totalResearchMinutes: number;
  activityDates: string[];
}

export interface DrawResponse {
  topic: Topic;
  remainingInPool: number;
  totalInFilter: number;
  cycleReset: boolean;
}
