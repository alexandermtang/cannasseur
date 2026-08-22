// The screens speak the original Firebase-era shape (`date`, `finalRating`);
// Postgres uses snake_case (`logged_at`, `final_rating`). Keeping the mapping in
// one place means the screens did not have to be rewritten around a new shape.

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
];

export function fromRow(row) {
  const log = {
    id: row.id,
    date: row.logged_at,
    strain: row.strain,
    type: row.type,
    tags: row.tags || [],
    finalRating: row.final_rating,
    notes: row.notes || ''
  };

  RATING_FIELDS.forEach(field => {
    log[field] = row[field] || 0;
  });

  return log;
}

export function toRow(log, userId) {
  const row = {
    user_id: userId,
    logged_at: log.date,
    strain: log.strain,
    type: log.type,
    tags: log.tags || [],
    final_rating: log.finalRating,
    notes: log.notes || ''
  };

  RATING_FIELDS.forEach(field => {
    row[field] = log[field] || 0;
  });

  return row;
}
