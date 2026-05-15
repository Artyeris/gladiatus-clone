export type ReportCategory = 'expedition' | 'arena';

export interface ReportRow {
  _id: string;
  createdAt: string;
  category: ReportCategory;
  opponentName: string;
  isWinner: boolean;
  isDraw: boolean;
  crownsDrop: number;
  experienceDrop: number;
}
