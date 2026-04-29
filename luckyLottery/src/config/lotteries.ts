export interface LotteryArea {
  name: string;        // 选区名称 (例如: 红球区, 前区, 百位等)
  color: 'red' | 'blue' | 'orange' | 'purple' | 'green'; // 主颜色用于UI
  min: number;         // 号码下限 (如 0 或 1)
  max: number;         // 号码上限 (如 9, 33等)
  selectCount: number; // 当前区域需要选几个
  allowDuplicate: boolean; // 是否允许同区号码重复选中 (如3D允许，但我们目前的逻辑是分区域，所以各个选区内部通常是不重复的, 由于位数可以视为多个选区，所以如果是多个互不相关的区域，该标志设为false，每个区域选1)
}

export interface LotteryConfig {
  id: string;
  name: string;
  type: 'fucai' | 'ticai';
  areas: LotteryArea[];
}

export const lotteries: LotteryConfig[] = [
  {
    id: 'ssq',
    name: '双色球',
    type: 'fucai',
    areas: [
      { name: '红球区', color: 'red', min: 1, max: 33, selectCount: 6, allowDuplicate: false },
      { name: '蓝球区', color: 'blue', min: 1, max: 16, selectCount: 1, allowDuplicate: false }
    ]
  },
  {
    id: 'dlt',
    name: '大乐透',
    type: 'ticai',
    areas: [
      { name: '前区', color: 'red', min: 1, max: 35, selectCount: 5, allowDuplicate: false },
      { name: '后区', color: 'blue', min: 1, max: 12, selectCount: 2, allowDuplicate: false }
    ]
  },
  {
    id: 'fc3d',
    name: '福彩3D',
    type: 'fucai',
    areas: [
      { name: '百位', color: 'orange', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '十位', color: 'orange', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '个位', color: 'orange', min: 0, max: 9, selectCount: 1, allowDuplicate: false }
    ]
  },
  {
    id: 'pls',
    name: '排列三',
    type: 'ticai',
    areas: [
      { name: '百位', color: 'green', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '十位', color: 'green', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '个位', color: 'green', min: 0, max: 9, selectCount: 1, allowDuplicate: false }
    ]
  },
  {
    id: 'plw',
    name: '排列五',
    type: 'ticai',
    areas: [
      { name: '万位', color: 'purple', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '千位', color: 'purple', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '百位', color: 'purple', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '十位', color: 'purple', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '个位', color: 'purple', min: 0, max: 9, selectCount: 1, allowDuplicate: false }
    ]
  },
  {
    id: 'qxc',
    name: '七星彩',
    type: 'ticai',
    areas: [
      { name: '前排一', color: 'red', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '前排二', color: 'red', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '前排三', color: 'red', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '前排四', color: 'red', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '前排五', color: 'red', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '前排六', color: 'red', min: 0, max: 9, selectCount: 1, allowDuplicate: false },
      { name: '第七位', color: 'blue', min: 0, max: 14, selectCount: 1, allowDuplicate: false },
    ]
  },
  {
    id: 'qlc',
    name: '七乐彩',
    type: 'fucai',
    areas: [
      { name: '红球区', color: 'red', min: 1, max: 30, selectCount: 7, allowDuplicate: false }
    ]
  },
  {
    id: 'kl8',
    name: '快乐8(选10)',
    type: 'fucai',
    areas: [
      { name: '80选10', color: 'orange', min: 1, max: 80, selectCount: 10, allowDuplicate: false }
    ]
  }
];

export const getLotteryById = (id: string): LotteryConfig | undefined => {
  return lotteries.find(item => item.id === id);
}
