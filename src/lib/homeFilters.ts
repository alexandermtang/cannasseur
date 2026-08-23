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

const defaultHomeFilters: HomeFilters = {
  sortType: 'mostRecent',
  selectedYear: null,
  searchText: ''
};

let homeFilters: HomeFilters = { ...defaultHomeFilters };

export function getHomeFilters(): HomeFilters {
  return homeFilters;
}

export function setHomeFilters(next: Partial<HomeFilters>): void {
  homeFilters = { ...homeFilters, ...next };
}

// Otherwise one account's filters silently carry over onto the next
// account's Home screen after a logout/login within the same app session —
// call this on sign-out.
export function resetHomeFilters(): void {
  homeFilters = { ...defaultHomeFilters };
}
