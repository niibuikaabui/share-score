export const COLORS = [
  { hex: '#ef4444', name: 'レッド' },
  { hex: '#f97316', name: 'オレンジ' },
  { hex: '#eab308', name: 'イエロー' },
  { hex: '#22c55e', name: 'グリーン' },
  { hex: '#06b6d4', name: 'シアン' },
  { hex: '#3b82f6', name: 'ブルー' },
  { hex: '#6366f1', name: 'インディゴ' },
  { hex: '#a855f7', name: 'パープル' },
  { hex: '#ec4899', name: 'ピンク' },
  { hex: '#f1f5f9', name: 'ホワイト' },
] as const;

export interface SetResult {
  scores: [number, number];
  winner: 0 | 1;
}

export interface Board {
  id: string;
  editKey: string;
  createdAt: string;
  teamNames: [string, string];
  teamColors: [string, string];
  currentSet: number;
  currentScores: [number, number];
  completedSets: SetResult[];
  matchWinner: 0 | 1 | null;
}

export type PublicBoard = Omit<Board, 'editKey'>;

export function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
