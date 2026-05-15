export const HIGHSCORE_PAGE_SIZE = 25;

export interface HighscorePage {
  characters: any[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
