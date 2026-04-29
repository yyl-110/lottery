<template>
  <view class="analysis-page">
    <view class="header-card glass-effect">
      <view class="lottery-picker mb-4">
        <picker mode="selector" :range="lotteryNames" :value="currentLotteryIndex" @change="onLotteryChange">
          <view class="picker-inner">
            <text class="picker-label">当前分析：</text>
            <text class="picker-value text-gradient">{{ currentLottery.name }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="desc">模拟展示该彩种近期的热点走势</view>
    </view>

    <view 
      v-for="(area, aIdx) in currentLottery.areas" 
      :key="aIdx"
      class="chart-container glass-effect mb-4"
    >
      <view class="chart-title" :class="getColorClass(area.color)">
        {{ area.name }} 出现频次 (Top 5)
      </view>
      <view class="bar-chart">
        <view class="bar-item" v-for="(item, index) in mockData[aIdx]" :key="index">
          <view class="bar-label">{{ formatNumber(item.num) }}</view>
          <view class="bar-track">
            <view class="bar-fill" :class="getBgColorClass(area.color)" :style="{ width: `${item.count * 10}%` }"></view>
          </view>
          <view class="bar-value">{{ item.count }} 次</view>
        </view>
      </view>
    </view>

    <view class="tip-card glass-effect mt-4">
      <text>💡 提示：以上数据为本地推演模拟图表，主要体验多选区自适应排版能力。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { lotteries } from '../../config/lotteries'

const currentLotteryIndex = ref(0)
const currentLottery = computed(() => lotteries[currentLotteryIndex.value])
const lotteryNames = computed(() => lotteries.map(l => l.name))

const mockData = ref<{num: number, count: number}[][]>([])

const formatNumber = (num: number) => num < 10 ? `0${num}` : `${num}`

const generateMockAnalysis = () => {
  const data: {num: number, count: number}[][] = []
  
  currentLottery.value.areas.forEach(area => {
    const areaMock: {num: number, count: number}[] = []
    // 随机选5个不重复的号码作为top5
    const tops = new Set<number>()
    // 防止 area 的总数字个数少于5，取较小值
    const totalPossible = area.max - area.min + 1
    const size = Math.min(5, totalPossible)
    
    while(tops.size < size) {
      tops.add(Math.floor(Math.random() * totalPossible) + area.min)
    }
    
    Array.from(tops).forEach((num, idx) => {
      areaMock.push({
        num,
        count: Math.floor(Math.random() * (7 - idx)) + 2 // 制造递减或随机的次数
      })
    })
    
    areaMock.sort((a, b) => b.count - a.count)
    data.push(areaMock)
  })
  
  mockData.value = data
}

// 初始化生成
generateMockAnalysis()

const onLotteryChange = (e: any) => {
  currentLotteryIndex.value = Number(e.detail.value)
  generateMockAnalysis()
}

const getColorClass = (color: string) => `text-${color}`
const getBgColorClass = (color: string) => `bg-${color}`
</script>

<style lang="scss">
.analysis-page {
  min-height: 100vh;
  padding: 16px;
  background: #f1f5f9;
  padding-bottom: 20px;
}

.header-card {
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  
  .lottery-picker {
    padding: 10px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    
    .picker-inner {
      display: flex;
      justify-content: center;
      align-items: center;
      
      .picker-label { font-size: 15px; color: #666; }
      .picker-value { font-size: 18px; font-weight: bold; margin: 0 4px; color: #3b82f6; }
      .picker-arrow { font-size: 12px; color: #999; }
    }
  }
  
  .desc { font-size: 13px; color: #666; margin-top: 6px; }
}

.chart-container {
  padding: 16px;
  border-radius: 12px;
  
  .chart-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    
    &.text-red { color: #EF4444; }
    &.text-blue { color: #3B82F6; }
    &.text-orange { color: #f97316; }
    &.text-green { color: #10b981; }
    &.text-purple { color: #8b5cf6; }
  }
}

.bar-chart {
  .bar-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .bar-label {
      width: 30px;
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
    
    .bar-track {
      flex: 1;
      height: 12px;
      background: #e2e8f0;
      border-radius: 6px;
      margin: 0 12px;
      overflow: hidden;
      
      .bar-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 1s ease-in-out;
        
        &.bg-red { background: linear-gradient(90deg, #ff9a9e 0%, #ef4444 100%); }
        &.bg-blue { background: linear-gradient(90deg, #a1c4fd 0%, #3b82f6 100%); }
        &.bg-orange { background: linear-gradient(90deg, #fb923c, #f97316 100%); }
        &.bg-green { background: linear-gradient(90deg, #34d399, #10b981 100%); }
        &.bg-purple { background: linear-gradient(90deg, #a78bfa, #8b5cf6 100%); }
      }
    }
    
    .bar-value {
      width: 44px;
      font-size: 13px;
      color: #64748b;
      text-align: right;
    }
  }
}

.tip-card {
  padding: 16px;
  border-radius: 12px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.6);
}

.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
</style>
