// Home's search/sort/year filters live in component state, so
// navigation.reset (used after submitting a log, to avoid leaving stale
// LogNewSession/SubmitLog screens on the back stack — see SubmitLogScreen)
// fully remounts HomeScreen and would otherwise silently drop whatever
// filter was active. Kept here, outside React state, so a fresh mount can
// restore it.

export type SortType =
  | 'mostRecent'
  | 'topRated'
  | 'happy'
  | 'creative'
  | 'active'
  | 'relaxed'
  | 'sleepy'
  | 'anxiety'
  | 'migraines'
  | 'depression'
  | 'pain'
  | 'insomnia';

export interface HomeFilters {
  sortType: SortType;
  selectedYear: number | null;
  searchText: string;
}

let homeFilters: HomeFilters = {
  sortType: 'mostRecent',
  selectedYear: null,
  searchText: ''
};

export function getHomeFilters(): HomeFilters {
  return homeFilters;
}

export function setHomeFilters(next: Partial<HomeFilters>): void {
  homeFilters = { ...homeFilters, ...next };
}
