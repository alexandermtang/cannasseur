// The pure filter/sort/label logic behind Home's search, sort, and year
// filters — kept dependency-free (no react/react-native imports) so it's
// testable without pulling in the whole RN/Expo module graph, and reusable
// outside the screen component.

import type { Log } from '../types/log';
import type { SortType } from './homeFilters';

const MOOD_TYPES = ['happy', 'creative', 'active', 'relaxed', 'sleepy'] as const;
const MEDICAL_TYPES = ['anxiety', 'migraines', 'depression', 'pain', 'insomnia'] as const;

type MoodField = (typeof MOOD_TYPES)[number];
type MedicalField = (typeof MEDICAL_TYPES)[number];

export const isMoodField = (type: SortType): type is MoodField =>
  (MOOD_TYPES as readonly string[]).includes(type);
export const isMedicalField = (type: SortType): type is MedicalField =>
  (MEDICAL_TYPES as readonly string[]).includes(type);

export const filterTextFor = (type: SortType): string => {
  if (type === 'mostRecent') return 'MOST RECENT';
  if (type === 'topRated') return 'TOP RATED';
  if (isMoodField(type)) return `MOOD: ${type.toUpperCase()}`;
  if (isMedicalField(type)) return `MEDICAL: ${type.toUpperCase()}`;
  return '';
};

// Phrasing for the empty state reads differently from the filter button's
// own label — "ACTIVE MOOD" for a mood field, but just "INSOMNIA" (no
// "MEDICAL" prefix) for a medical one.
export const emptyStateLabelFor = (type: SortType): string => {
  if (isMoodField(type)) return `${type.toUpperCase()} MOOD`;
  if (isMedicalField(type)) return type.toUpperCase();
  return '';
};

export const emptyStateMessage = (type: SortType, year: number | null): string => {
  const base =
    isMoodField(type) || isMedicalField(type) ? `NO LOGS FOR ${emptyStateLabelFor(type)}` : 'NO LOGS';
  return year === null ? base : `${base} IN ${year}`;
};

export const sortLogs = (logs: Log[], type: SortType): Log[] => {
  if (type === 'mostRecent') {
    const sorted = [...logs];
    sorted.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    return sorted;
  }
  if (type === 'topRated') {
    const sorted = [...logs];
    sorted.sort((a, b) => (b.finalRating || 0) - (a.finalRating || 0));
    return sorted;
  }
  if (isMoodField(type) || isMedicalField(type)) {
    // A 0 means that mood/medical effect wasn't rated at all for that log —
    // filtering it out rather than just sorting it to the bottom, since
    // "Mood: Happy" implies "logs rated for happiness," not "every log."
    return logs
      .filter(log => log[type] > 0)
      .sort(
        (a, b) =>
          b[type] - a[type] ||
          (b.finalRating || 0) - (a.finalRating || 0) ||
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
  }
  return logs;
};

export const searchLogs = (logs: Log[], searchText: string): Log[] => {
  if (searchText === '') return logs;
  return logs.filter(
    log =>
      log.strain.toLowerCase().includes(searchText.toLowerCase()) ||
      (log.tags || []).some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  );
};

// null means ALL TIME — no filtering.
export const filterByYear = (logs: Log[], year: number | null): Log[] => {
  if (year === null) return logs;
  return logs.filter(log => log.date && new Date(log.date).getFullYear() === year);
};
