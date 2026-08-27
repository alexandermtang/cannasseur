import {
  filterByYear,
  searchLogs,
  sortLogs,
  filterTextFor,
  emptyStateLabelFor,
  emptyStateMessage,
  isMoodField,
  isMedicalField
} from './homeLogFilters';
import type { Log } from '@/types/log';

let idCounter = 0;

const makeLog = (overrides: Partial<Log> = {}): Log => {
  idCounter += 1;
  return {
    id: `log-${idCounter}`,
    date: '2024-06-15T12:00:00.000Z',
    strain: 'Test Strain',
    type: 'Flower',
    happy: 0,
    creative: 0,
    active: 0,
    relaxed: 0,
    sleepy: 0,
    anxiety: 0,
    migraines: 0,
    depression: 0,
    pain: 0,
    insomnia: 0,
    tags: [],
    finalRating: 0,
    notes: '',
    ...overrides
  };
};

describe('filterByYear', () => {
  it('returns every log for ALL TIME (null)', () => {
    const logs = [makeLog({ date: '2019-01-01' }), makeLog({ date: '2024-01-01' })];
    expect(filterByYear(logs, null)).toEqual(logs);
  });

  it('keeps only logs whose date falls in the given year', () => {
    const in2019 = makeLog({ date: '2019-06-01' });
    const in2024 = makeLog({ date: '2024-06-01' });
    expect(filterByYear([in2019, in2024], 2019)).toEqual([in2019]);
  });

  it('excludes logs with no date from a specific-year filter', () => {
    const noDate = makeLog({ date: undefined });
    expect(filterByYear([noDate], 2024)).toEqual([]);
  });
});

describe('searchLogs', () => {
  const purple = makeLog({ strain: 'Purple Haze', tags: ['Relaxing'] });
  const og = makeLog({ strain: 'OG Kush', tags: ['Focus', 'Purple Vibes'] });

  it('returns every log for an empty search', () => {
    expect(searchLogs([purple, og], '')).toEqual([purple, og]);
  });

  it('matches by strain, case-insensitively', () => {
    expect(searchLogs([purple, og], 'purple haze')).toEqual([purple]);
  });

  it('matches by tag, case-insensitively', () => {
    expect(searchLogs([purple, og], 'purple')).toEqual([purple, og]);
  });

  it('excludes logs that match neither strain nor tags', () => {
    expect(searchLogs([purple, og], 'sativa')).toEqual([]);
  });
});

describe('sortLogs', () => {
  it('mostRecent sorts by date, newest first', () => {
    const older = makeLog({ date: '2024-01-01' });
    const newer = makeLog({ date: '2024-06-01' });
    expect(sortLogs([older, newer], 'mostRecent')).toEqual([newer, older]);
  });

  it('topRated sorts by final rating, highest first', () => {
    const low = makeLog({ finalRating: 2 });
    const high = makeLog({ finalRating: 5 });
    expect(sortLogs([low, high], 'topRated')).toEqual([high, low]);
  });

  it('a mood/medical field filters out logs never rated for it', () => {
    const rated = makeLog({ happy: 2 });
    const unrated = makeLog({ happy: 0 });
    expect(sortLogs([unrated, rated], 'happy')).toEqual([rated]);
  });

  it('a mood/medical field breaks ties by final rating, then most recent', () => {
    const tiedLowRating = makeLog({ sleepy: 2, finalRating: 2, date: '2024-01-01' });
    const tiedHighRating = makeLog({ sleepy: 2, finalRating: 4, date: '2024-02-01' });
    const tiedOlder = makeLog({ sleepy: 2, finalRating: 4, date: '2023-01-01' });

    const result = sortLogs([tiedLowRating, tiedOlder, tiedHighRating], 'sleepy');

    expect(result).toEqual([tiedHighRating, tiedOlder, tiedLowRating]);
  });
});

describe('filterTextFor', () => {
  it('labels the built-in sorts', () => {
    expect(filterTextFor('mostRecent')).toBe('MOST RECENT');
    expect(filterTextFor('topRated')).toBe('TOP RATED');
  });

  it('labels a mood field with the MOOD: prefix', () => {
    expect(filterTextFor('happy')).toBe('MOOD: HAPPY');
  });

  it('labels a medical field with the MEDICAL: prefix', () => {
    expect(filterTextFor('insomnia')).toBe('MEDICAL: INSOMNIA');
  });
});

describe('emptyStateLabelFor', () => {
  it('appends MOOD for a mood field', () => {
    expect(emptyStateLabelFor('active')).toBe('ACTIVE MOOD');
  });

  it('has no MEDICAL prefix for a medical field', () => {
    expect(emptyStateLabelFor('insomnia')).toBe('INSOMNIA');
  });
});

describe('emptyStateMessage', () => {
  it('is plain "NO LOGS" for Most Recent/Top Rated with no year', () => {
    expect(emptyStateMessage('mostRecent', null)).toBe('NO LOGS');
    expect(emptyStateMessage('topRated', null)).toBe('NO LOGS');
  });

  it('appends the year at the end when one is selected', () => {
    expect(emptyStateMessage('mostRecent', 2026)).toBe('NO LOGS IN 2026');
  });

  it('includes the field label for a mood/medical filter', () => {
    expect(emptyStateMessage('insomnia', null)).toBe('NO LOGS FOR INSOMNIA');
    expect(emptyStateMessage('insomnia', 2026)).toBe('NO LOGS FOR INSOMNIA IN 2026');
    expect(emptyStateMessage('active', 2026)).toBe('NO LOGS FOR ACTIVE MOOD IN 2026');
  });
});

describe('isMoodField / isMedicalField', () => {
  it('classifies mood fields', () => {
    expect(isMoodField('happy')).toBe(true);
    expect(isMoodField('insomnia')).toBe(false);
    expect(isMoodField('mostRecent')).toBe(false);
  });

  it('classifies medical fields', () => {
    expect(isMedicalField('insomnia')).toBe(true);
    expect(isMedicalField('happy')).toBe(false);
    expect(isMedicalField('topRated')).toBe(false);
  });
});
