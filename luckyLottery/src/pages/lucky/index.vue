<template>
  <view class="lucky-page">
    <view class="header-card glass-effect">
      <view class="title">测算我的幸运数字</view>
      <view class="desc">输入您的特殊日期或数字，为您生成专属幸运号</view>
    </view>

    <view class="form-section glass-effect">
      <view class="lottery-picker mb-4">
        <picker mode="selector" :range="lotteryNames" :value="currentLotteryIndex" @change="onLotteryChange">
          <view class="picker-inner">
            <text class="picker-label">目标彩种：</text>
            <text class="picker-value text-gradient">{{ currentLottery.name }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="input-group">
        <text class="label">幸运日期/特殊数字</text>
        <input class="input-field" type="number" v-model="seedInput" placeholder="例如生日 19990808 或幸运数 7" />
      </view>
      
      <button class="btn-generate" @tap="generateLuckyNumber">
        <text>✨ 魔法生成 ✨</text>
      </button>
    </view>

    <view class="result-section glass-effect" v-if="hasResult">
      <view class="result-title">🌟 专属的 {{ currentLottery.name }} 🌟</view>
      
      <view class="balls-display">
        <template v-for="(selectionArray, aIdx) in luckySelections" :key="'area'+aIdx">
          <view 
            v-for="(num, numIdx) in selectionArray" 
            :key="'num'+aIdx+'-'+numIdx" 
            class="ball slide-in"
            :class="getBgColorClass(currentLottery.areas[aIdx].color)"
            :style="{ animationDelay: `${(aIdx * selectionArray.length + numIdx) * 0.1}s` }"
          >
            {{ formatNumber(num) }}
          </view>
          <view class="separator" v-if="aIdx < luckySelections.length - 1">+</view>
        </template>
      </view>

      <button class="btn-save mt-4" @tap="saveSelection">保存此幸运组合</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'
import { lotteries } from '../../config/lotteries'

const seedInput = ref('')
const hasResult = ref(false)

const currentLotteryIndex = ref(0)
const currentLottery = computed(() => lotteries[currentLotteryIndex.value])
const lotteryNames = computed(() => lotteries.map(l => l.name))

const luckySelections = ref<number[][]>([])

const onLotteryChange = (e: any) => {
  currentLotteryIndex.value = Number(e.detail.value)
  hasResult.value = false
}

const formatNumber = (num: number) => num < 10 ? `0${num}` : `${num}`
const getBgColorClass = (color: string) => `bg-${color}`

const generateLuckyNumber = () => {
  if (!seedInput.value) {
    Taro.showToast({ title: '请输入幸运数字作种子', icon: 'none' })
    return
  }
  
  Taro.showLoading({ title: '正在施展魔法...' })
  
  setTimeout(() => {
    // 伪随机算法，使用输入作为种子进行模拟
    let seed = parseInt(seedInput.value.replace(/\D/g, '')) || Date.now()
    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }

    const newSelection: number[][] = []
    
    currentLottery.value.areas.forEach(area => {
      const arr = new Set<number>()
      while(arr.size < area.selectCount) {
        const rand = Math.floor(pseudoRandom() * (area.max - area.min + 1)) + area.min
        arr.add(rand)
      }
      newSelection.push(Array.from(arr).sort((a, b) => a - b))
    })
    
    luckySelections.value = newSelection
    hasResult.value = true
    Taro.hideLoading()
  }, 1000)
}

const saveSelection = () => {
  const history = Taro.getStorageSync('lottery_history_v2') || []
  const newItem = {
    id: Date.now(),
    lotteryId: currentLottery.value.id,
    lotteryName: currentLottery.value.name,
    selections: luckySelections.value.map(arr => [...arr]),
    date: new Date().toLocaleDateString() + ' (幸运生成)'
  }
  history.unshift(newItem)
  Taro.setStorageSync('lottery_history_v2', history)
  
  Taro.showToast({ title: '已保存至历史记录', icon: 'success' })
}
</script>

<style lang="scss">
.lucky-page {
  min-height: 100vh;
  padding: 16px;
  background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
  padding-bottom: 20px;
}

.header-card {
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  
  .title { font-size: 22px; font-weight: 800; color: #4a4a4a; }
  .desc { font-size: 14px; color: #666; margin-top: 8px; }
}

.form-section {
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;

  .lottery-picker {
    padding: 10px;
    background: #fff;
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
  
  .input-group {
    margin-bottom: 24px;
    
    .label {
      display: block;
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 12px;
    }
    
    .input-field {
      width: 100%;
      height: 48px;
      padding: 0 16px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid #ddd;
      font-size: 16px;
    }
  }
  
  .btn-generate {
    background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
    color: #1a5c32;
    font-weight: bold;
    border-radius: 24px;
    font-size: 18px;
    border: none;
    &::after { display: none; }
  }
}

.result-section {
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  
  .result-title {
    font-size: 18px;
    font-weight: bold;
    color: #EF4444;
    margin-bottom: 20px;
  }
  
  .balls-display {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    
    .ball {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      color: #fff;
      opacity: 0;
      transform: translateY(20px);
      animation: slideIn 0.5s forwards;
      
      &.bg-red { background: linear-gradient(135deg, #ff6b6b, #ef4444); }
      &.bg-blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
      &.bg-orange { background: linear-gradient(135deg, #fb923c, #f97316); }
      &.bg-green { background: linear-gradient(135deg, #34d399, #10b981); }
      &.bg-purple { background: linear-gradient(135deg, #a78bfa, #8b5cf6); }
    }
    
    .separator { color: #333; font-weight: bold; }
  }
  
  .btn-save {
    background: rgba(255, 255, 255, 0.8);
    color: #333;
    border-radius: 20px;
    font-size: 15px;
  }
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
</style>
