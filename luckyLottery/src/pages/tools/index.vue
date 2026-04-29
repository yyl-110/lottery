<template>
  <view class="tools-page">
    <view class="header-card glass-effect">
      <view class="title text-gradient">工具箱</view>
      <view class="subtitle">您的智能测算套件</view>
    </view>

    <view class="grid-nav">
      <view class="nav-item glass-effect" @tap="navigateTo('/pages/selection/index')">
        <view class="icon bg-red"></view>
        <view class="text-info">
          <text class="label">模拟选号</text>
          <text class="desc">全玩法推演算力</text>
        </view>
      </view>
      
      <view class="nav-item glass-effect" @tap="navigateTo('/pages/lucky/index')">
        <view class="icon bg-blue"></view>
        <view class="text-info">
          <text class="label">幸运生成</text>
          <text class="desc">专属词条魔法</text>
        </view>
      </view>
      
      <view class="nav-item glass-effect" @tap="navigateTo('/pages/analysis/index')">
        <view class="icon bg-orange"></view>
        <view class="text-info">
          <text class="label">走势分析</text>
          <text class="desc">高频追踪数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'

const navigateTo = (url: string) => {
  Taro.navigateTo({ url })
}
</script>

<style lang="scss">
.tools-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%);
}

.header-card {
  padding: 30px 20px;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 24px;

  .title {
    font-size: 28px;
    font-weight: 900;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #666;
  }
}

.grid-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .nav-item {
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.98);
    }

    .icon {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      margin-right: 16px;
      flex-shrink: 0;
    }
    
    .text-info {
      display: flex;
      flex-direction: column;
      
      .label {
        font-size: 18px;
        color: #333;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .desc {
        font-size: 12px;
        color: #888;
      }
    }

    .bg-red { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); }
    .bg-blue { background: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%); }
    .bg-orange { background: linear-gradient(120deg, #f6d365 0%, #fda085 100%); }
  }
}
</style>
