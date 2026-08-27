import type { Log, LogRow, LogRowInsert } from '@/types/log';

const RATING_FIELDS = [
  'happy',
  'creative',
  'active',
  'relaxed',
  'sleepy',
  'anxiety',
  'migraines',
  'depression',
  'pain',
  'insomnia'
] as const;

export function fromRow(row: LogRow): Log {
  const log: Log = {
    id: row.id,
    date: row.logged_at,
    strain: row.strain,
    type: row.type,
    tags: row.tags || [],
    finalRating: row.final_rating,
    notes: row.notes || '',
    happy: 0,
    creative: 0,
    active: 0,
    relaxed: 0,
    sleepy: 0,
    anxiety: 0,
    migraines: 0,
    depression: 0,
    pain: 0,
    insomnia: 0
  };

  RATING_FIELDS.forEach(field => {
    log[field] = row[field] || 0;
  });

  return log;
}

export function toRow(log: Log, userId: string | null): LogRowInsert {
  const row: LogRowInsert = {
    user_id: userId as string,
    logged_at: log.date || new Date().toISOString(),
    strain: log.strain,
    type: log.type,
    tags: log.tags || [],
    final_rating: log.finalRating ?? 0,
    notes: log.notes || '',
    happy: 0,
    creative: 0,
    active: 0,
    relaxed: 0,
    sleepy: 0,
    anxiety: 0,
    migraines: 0,
    depression: 0,
    pain: 0,
    insomnia: 0
  };

  RATING_FIELDS.forEach(field => {
    row[field] = log[field] || 0;
  });

  return row;
}
