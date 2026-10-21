export interface LessonMeta {
  drill_id: string;
  order_index: number;
  word_count: number;
  total_chars: number;
  max_group_len: number;
  type: string;
  lang: string;
  desc: string;
}

export interface Lesson {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  orderIndex: number;
  difficulty: number;
  drillsMeta?: LessonMeta[] | string;
}

export interface DrillLine {
  groups: string[];
  isLoopStart?: boolean;
}

export interface Drill {
  id: string;
  title: string;
  orderIndex: number;
  lessonId: string;
  lines: DrillLine[];
}

export interface LeaderboardRecord {
  id?: string;
  username: string;
  lessonId: string;
  drillId: string;
  wpm: number;
  accuracy: number;
  timeSpent: number;
  createdAt: string;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  errorChars: number;
  totalChars: number;
  timeElapsed: number;
}
