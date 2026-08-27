export type LogKind = 'Flower' | 'Concentrate';

export interface Log {
  id?: string;
  date?: string;
  strain: string;
  type: LogKind;

  happy: number;
  creative: number;
  active: number;
  relaxed: number;
  sleepy: number;

  anxiety: number;
  migraines: number;
  depression: number;
  pain: number;
  insomnia: number;

  tags: string[];
  finalRating?: number;
  notes?: string;
}

export interface LogRow {
  id: string;
  user_id: string;
  logged_at: string;
  strain: string;
  type: LogKind;

  happy: number;
  creative: number;
  active: number;
  relaxed: number;
  sleepy: number;

  anxiety: number;
  migraines: number;
  depression: number;
  pain: number;
  insomnia: number;

  tags: string[];
  final_rating: number;
  notes: string | null;
  created_at: string;
}

export type LogRowInsert = Omit<LogRow, 'id' | 'created_at'>;
