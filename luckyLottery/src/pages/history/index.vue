<template>
  <view class="history-page">
    <view class="header-card glass-effect">
      <view class="title">我的选号记录</view>
    </view>

    <view class="list">
      <view v-if="history.length === 0" class="empty">
        <text>暂无记录，快去选号吧！</text>
      </view>
      
      <view 
        v-for="item in history" :key="item.id"
        class="history-item glass-effect"
      >
        <view class="item-header">
          <view class="lottery-tag">{{ item.lotteryName }}</view>
          <view class="right-info">
            <text class="date">{{ item.date }}</text>
            <text class="delete-btn" @tap="deleteItem(item.id)">删除</text>
          </view>
        </view>
        
        <view class="balls-display">
          <template v-for="(selectionArray, aIdx) in item.selections" :key="'area'+aIdx">
            <view 
              v-for="(num, numIdx) in selectionArray" 
              :key="'num'+aIdx+'-'+numIdx" 
              class="ball"
              :class="getBgColorClass(getAreaColor(item.lotteryId, aIdx))"
            >
              {{ formatNumber(num) }}
            </view>
            <view class="separator" v-if="aIdx < item.selections.length - 1">+</view>
          </template>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { getLotteryById } from '../../config/lotteries'

const history = ref<any[]>([])

useDidShow(() => {
  loadHistory()
})

const loadHistory = () => {
  history.value = Taro.getStorageSync('lottery_history_v2') || []
}

const formatNumber = (num: number) => num < 10 ? `0${num}` : `${num}`

const getAreaColor = (lotteryId: string, areaIndex: number) => {
  const cfg = getLotteryById(lotteryId)
  if (cfg && cfg.areas[areaIndex]) {
    return cfg.areas[areaIndex].color
  }
  return 'red'
}

const getBgColorClass = (color: string) => `bg-${color}`

const deleteItem = (id: number) => {
  Taro.showModal({
    title: '提示',
    content: '确定要删除这条记录吗？',
    success: function (res) {
      if (res.confirm) {
        history.value = history.value.filter(i => i.id !== id)
        Taro.setStorageSync('lottery_history_v2', history.value)
      }
    }
  })
}
</script>

<style lang="scss">
.history-page {
  min-height: 100vh;
  padding: 16px;
  background: #f8f9fa;
}

.header-card {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  
  .title { font-size: 18px; font-weight: bold; color: #333; }
}

.empty { text-align: center; color: #999; padding: 40px 0; }

.history-item {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    
    .lottery-tag {
      background: #EF4444;
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .right-info {
      .date { color: #666; margin-right: 12px; }
      .delete-btn { color: #EF4444; }
    }
  }
  
  .balls-display {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    
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
    
    .separator { color: #999; font-weight: bold; margin: 0 4px; }
  }
}
</style>
