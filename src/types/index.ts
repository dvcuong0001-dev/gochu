export interface LessonMeta {
  id?: string;
  drill_id?: string;
  drillId?: string;
  order_index?: number;
  orderIndex?: number;
  word_count?: number;
  wordCount?: number;
  total_chars?: number;
  totalChars?: number;
  max_group_len?: number;
  maxGroupLen?: number;
  type?: string | number;
  lang?: string;
  desc?: string;
  title?: string;
  isExam?: boolean;
  targetWpm?: number;
  minAccuracy?: number;
}

export interface Lesson {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  orderIndex: number;
  difficulty: number;
  category?: string;
  drillsMeta?: LessonMeta[] | string;
}

export interface DrillLine {
  groups: string[];
  isLoopStart?: boolean;
}

export interface Drill {
  id: string;
  title: string;
  orderIndex?: number;
  lessonId: string;
  lines: DrillLine[];
  rawText?: string;
  type?: string | number;
  lang?: string;
  desc?: string;
  isExam?: boolean;
  targetWpm?: number;
  minAccuracy?: number;
}

export interface UserProfile {
  username: string;
  pin?: string;
  avatar: string;
  level: number;
  xp: number;
  joinedAt: string;
  isGuest?: boolean;
  unlockedLessons?: string[];
  bestWpm?: number;
  avgAccuracy?: number;
  totalTimeSeconds?: number;
}

export interface LeaderboardUserRecord {
  id?: string;
  username: string;
  pin?: string;
  avatar?: string;
  level: number;
  xp: number;
  bestWpm: number;
  avgAccuracy: number;
  totalTimeSeconds: number;
  completedDrills: number;
  unlockedLessons?: string[];
  lastActive?: string;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  errorChars: number;
  totalChars: number;
  timeElapsed: number;
}
