<template>
  <view class="selection-page">
    <view class="header-card glass-effect">
      <view class="lottery-picker mb-4">
        <picker mode="selector" :range="lotteryNames" :value="currentLotteryIndex" @change="onLotteryChange">
          <view class="picker-inner">
            <text class="picker-label">当前彩种：</text>
            <text class="picker-value text-gradient">{{ currentLottery.name }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="desc">请按照各区规则完成选号</view>
    </view>

    <view 
      v-for="(area, aIdx) in currentLottery.areas" 
      :key="aIdx"
      class="ball-section glass-effect mb-4"
    >
      <view class="section-title" :class="getColorClass(area.color)">
        {{ area.name }} 
        <text class="count-hint">(选 {{ area.selectCount }} 个，已选 {{ selectedNumbers[aIdx].length }})</text>
      </view>
      <view class="balls-grid">
        <view 
          v-for="num in getRange(area.min, area.max)" :key="'num-'+num"
          class="ball"
          :class="[getBgColorClass(area.color), { active: selectedNumbers[aIdx].includes(num) }]"
          @tap="toggleNum(aIdx, num)"
        >
          {{ formatNumber(num) }}
        </view>
      </view>
    </view>

    <view class="bottom-actions glass-effect">
      <button class="btn btn-clear" @tap="clearSelection">清空</button>
      <button class="btn btn-random" @tap="randomGenerate">机选一注</button>
      <button class="btn btn-save" @tap="saveSelection">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'
import { lotteries } from '../../config/lotteries'

const currentLotteryIndex = ref(0)
const currentLottery = computed(() => lotteries[currentLotteryIndex.value])
const lotteryNames = computed(() => lotteries.map(l => l.name))

// selectedNumbers 维度为: [选区索引][选中的具体号码数组]
const selectedNumbers = ref<number[][]>([])

const initSelection = () => {
  selectedNumbers.value = currentLottery.value.areas.map(() => [])
}
initSelection() // 页面初始调用

const onLotteryChange = (e: any) => {
  currentLotteryIndex.value = Number(e.detail.value)
  initSelection()
}

const getRange = (min: number, max: number) => {
  const range: number[] = []
  for (let i = min; i <= max; i++) {
    range.push(i)
  }
  return range
}

const formatNumber = (num: number) => num < 10 ? `0${num}` : `${num}`

const getColorClass = (color: string) => `text-${color}`
const getBgColorClass = (color: string) => `bg-${color}`

const toggleNum = (areaIndex: number, num: number) => {
  const area = currentLottery.value.areas[areaIndex]
  const arr = selectedNumbers.value[areaIndex]
  
  const idx = arr.indexOf(num)
  if (idx > -1) {
    arr.splice(idx, 1)
  } else {
    if (arr.length >= area.selectCount) {
      if (area.selectCount === 1) {
        // 单选的话直接替换
        selectedNumbers.value[areaIndex] = [num]
      } else {
        Taro.showToast({ title: `${area.name}最多选${area.selectCount}个`, icon: 'none' })
      }
      return
    }
    arr.push(num)
    arr.sort((a, b) => a - b)
  }
}

const clearSelection = () => {
  initSelection()
}

const randomGenerate = () => {
  const newSelection: number[][] = []
  
  currentLottery.value.areas.forEach(area => {
    const arr = new Set<number>()
    while(arr.size < area.selectCount) {
      const rand = Math.floor(Math.random() * (area.max - area.min + 1)) + area.min
      arr.add(rand)
    }
    newSelection.push(Array.from(arr).sort((a, b) => a - b))
  })
  
  selectedNumbers.value = newSelection
}

const saveSelection = () => {
  let isComplete = true
  for (let i = 0; i < currentLottery.value.areas.length; i++) {
    if (selectedNumbers.value[i].length < currentLottery.value.areas[i].selectCount) {
      isComplete = false
      break
    }
  }
  
  if (!isComplete) {
    Taro.showToast({ title: '请按规则完成所有选区号池', icon: 'none' })
    return
  }
  
  const history = Taro.getStorageSync('lottery_history_v2') || []
  const newItem = {
    id: Date.now(),
    lotteryId: currentLottery.value.id,
    lotteryName: currentLottery.value.name,
    selections: selectedNumbers.value.map(arr => [...arr]), // 复制数组防止引用关联
    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('cn-ZH', {hour12: false}).substring(0,5)
  }
  history.unshift(newItem)
  Taro.setStorageSync('lottery_history_v2', history)
  
  Taro.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => {
    Taro.switchTab({ url: '/pages/history/index' })
  }, 1500)
}
</script>

<style lang="scss">
.selection-page {
  min-height: 100vh;
  padding: 16px;
  background: #f8f9fa;
  padding-bottom: 100px;
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
    border: 1px solid #eee;
    
    .picker-inner {
      display: flex;
      justify-content: center;
      align-items: center;
      
      .picker-label { font-size: 16px; color: #666; }
      .picker-value { font-size: 20px; font-weight: bold; margin: 0 4px; }
      .picker-arrow { font-size: 12px; color: #999; }
    }
  }
  
  .desc {
    font-size: 14px;
    color: #777;
    margin-top: 8px;
  }
}

.mb-4 { margin-bottom: 16px; }

.ball-section {
  padding: 16px;
  border-radius: 12px;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #eee;
    
    .count-hint { font-size: 12px; font-weight: normal; margin-left: 8px; }
  }
  
  .text-red { color: #EF4444; }
  .text-blue { color: #3B82F6; }
  .text-orange { color: #f97316; }
  .text-green { color: #10b981; }
  .text-purple { color: #8b5cf6; }
}

.balls-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  .ball {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 500;
    background: #fff;
    border: 1px solid #ddd;
    color: #666;
    transition: all 0.2s;
    
    &:active {
      transform: scale(0.9);
    }
    
    &.active {
      color: #fff;
      border-color: transparent;
      
      &.bg-red { background: linear-gradient(135deg, #ff6b6b, #ef4444); box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3); }
      &.bg-blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3); }
      &.bg-orange { background: linear-gradient(135deg, #fb923c, #f97316); box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3); }
      &.bg-green { background: linear-gradient(135deg, #34d399, #10b981); box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3); }
      &.bg-purple { background: linear-gradient(135deg, #a78bfa, #8b5cf6); box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3); }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 30px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  z-index: 10;
  
  .btn {
    flex: 1;
    height: 44px;
    line-height: 44px;
    border-radius: 22px;
    font-size: 16px;
    border: none;
    
    &::after { display: none; }
  }
  
  .btn-clear { background: #f1f5f9; color: #64748b; }
  .btn-random { background: linear-gradient(120deg, #f6d365 0%, #fda085 100%); color: #fff; font-weight: bold; }
  .btn-save { background: linear-gradient(135deg, #ff6b6b, #ef4444); color: #fff; font-weight: bold; }
}
</style>
