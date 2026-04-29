<template>
  <view class="results-page">
    <view class="header-banner glass-effect">
      <view class="title text-gradient">今日开奖大厅</view>
      <view class="subtitle">全网实时同步，祝您早日中奖！</view>
    </view>

    <view class="results-list">
      <view 
        v-for="(item, index) in mockResults" 
        :key="index"
        class="result-card glass-effect"
      >
        <view class="card-header">
          <view class="lottery-info">
            <text class="l-name">{{ item.name }}</text>
            <text class="l-issue">第 {{ item.issue }} 期</text>
          </view>
          <text class="l-date">{{ item.date }}</text>
        </view>
        
        <view class="balls-display">
          <template v-for="(selArr, aIdx) in item.selections" :key="'a'+aIdx">
            <view 
              v-for="(num, numIdx) in selArr" 
              :key="'n'+aIdx+'-'+numIdx"
              class="ball"
              :class="getBgColorClass(item.areas[aIdx].color)"
            >
              {{ formatNumber(num) }}
            </view>
            <view v-if="aIdx < item.selections.length - 1" class="separator">+</view>
          </template>
        </view>
        
        <view class="card-footer">
          <text>本期销量：{{ item.sales }} 亿元</text>
          <text class="detail-btn">查看详情 ></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { lotteries, LotteryConfig } from '../../config/lotteries'
import { lotteryService } from '../../services/lotteryService'

const mockResults = ref<any[]>([])

const formatNumber = (num: number) => num < 10 ? `0${num}` : `${num}`
const getBgColorClass = (color: string) => `bg-${color}`

onMounted(async () => {
  try {
    const results = await lotteryService.getLatestResults()
    mockResults.value = results.map(item => {
      const lottery = lotteries.find(l => l.id === item.id)
      return {
        ...item,
        areas: lottery ? lottery.areas : []
      }
    })
  } catch (err) {
    console.error('Fetch lottery error:', err)
    Taro.showToast({ title: '加载失败，使用演示数据', icon: 'none' })
    // 如果失败，保留默认的 mock 逻辑或显示空
    generateMockData()
  }
})

const generateMockData = () => {
  const results: any[] = []
  lotteries.forEach((lottery: LotteryConfig) => {
    const selections: number[][] = []
    lottery.areas.forEach(area => {
      const arr = new Set<number>()
      while(arr.size < area.selectCount) {
        arr.add(Math.floor(Math.random() * (area.max - area.min + 1)) + area.min)
      }
      selections.push(Array.from(arr).sort((a, b) => a - b))
    })

    results.push({
      id: lottery.id,
      name: lottery.name,
      areas: lottery.areas,
      issue: '2026' + String(Math.floor(Math.random()*100)).padStart(3, '0'),
      date: '演示数据',
      sales: '0.00',
      selections
    })
  })
  mockResults.value = results
}
</script>

<style lang="scss">
.results-page {
  min-height: 100vh;
  padding: 16px;
  background: #f1f5f9;
  padding-bottom: 20px;
}

.header-banner {
  padding: 24px 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  text-align: center;
  
  .title {
    font-size: 26px;
    font-weight: 900;
    margin-bottom: 8px;
  }
  .subtitle {
    font-size: 14px;
    color: #64748b;
  }
}

.result-card {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #fff;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
    
    .lottery-info {
      .l-name { font-size: 16px; font-weight: bold; color: #333; margin-right: 8px; }
      .l-issue { font-size: 12px; color: #94a3b8; }
    }
    .l-date { font-size: 12px; color: #EF4444; font-weight: 500; }
  }
  
  .balls-display {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
    
    .ball {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: #fff;
      
      &.bg-red { background: linear-gradient(135deg, #ff6b6b, #ef4444); box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); }
      &.bg-blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); }
      &.bg-orange { background: linear-gradient(135deg, #fb923c, #f97316); box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3); }
      &.bg-green { background: linear-gradient(135deg, #34d399, #10b981); box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3); }
      &.bg-purple { background: linear-gradient(135deg, #a78bfa, #8b5cf6); box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3); }
    }
    
    .separator { color: #94a3b8; font-weight: bold; margin: 0 2px; }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #64748b;
    
    .detail-btn { color: #3b82f6; }
  }
}
</style>
