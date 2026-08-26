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

export function resetHomeFilters(): void {
  homeFilters = { ...defaultHomeFilters };
}
