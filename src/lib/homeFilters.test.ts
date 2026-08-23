import { getHomeFilters, setHomeFilters, resetHomeFilters } from './homeFilters';

describe('homeFilters', () => {
  beforeEach(() => {
    resetHomeFilters();
  });

  it('defaults to Most Recent, ALL TIME, and no search text', () => {
    expect(getHomeFilters()).toEqual({
      sortType: 'mostRecent',
      selectedYear: null,
      searchText: ''
    });
  });

  it('merges a partial update without touching other fields', () => {
    setHomeFilters({ selectedYear: 2021 });
    expect(getHomeFilters()).toEqual({
      sortType: 'mostRecent',
      selectedYear: 2021,
      searchText: ''
    });

    setHomeFilters({ sortType: 'topRated' });
    expect(getHomeFilters()).toEqual({
      sortType: 'topRated',
      selectedYear: 2021,
      searchText: ''
    });
  });

  it('resets every field back to defaults, discarding prior changes', () => {
    setHomeFilters({ sortType: 'happy', selectedYear: 2019, searchText: 'purple' });
    resetHomeFilters();
    expect(getHomeFilters()).toEqual({
      sortType: 'mostRecent',
      selectedYear: null,
      searchText: ''
    });
  });
});
