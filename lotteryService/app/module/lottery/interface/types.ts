export interface LotteryArea {
  name: string;
  color: string;
  min: number;
  max: number;
  selectCount: number;
  allowDuplicate: boolean;
}

export interface LotteryResult {
  id: string;
  name: string;
  issue: string;
  date: string;
  sales: string;
  selections: number[][];
}

export type LotteryType = 'ssq' | '3d' | 'qlc' | 'kl8' | 'dlt' | 'pls' | 'plw' | 'qxc';
