export type LogKind = 'Flower' | 'Concentrate';

// The screens speak this shape (`date`, `finalRating`) — see src/lib/logs.ts
// for the mapping to/from the Postgres row shape.
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
