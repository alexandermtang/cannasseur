import type { Log } from '@/types/log';
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

export const filterByYear = (logs: Log[], year: number | null): Log[] => {
  if (year === null) return logs;
  return logs.filter(log => log.date && new Date(log.date).getFullYear() === year);
};
