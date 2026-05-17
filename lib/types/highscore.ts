export const HIGHSCORE_PAGE_SIZE = 25;

export type HighscorePeriod = 'all' | 'week';

export interface HighscorePage {
  characters: any[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  period: HighscorePeriod;
}
