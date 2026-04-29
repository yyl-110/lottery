export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/tools/index',
    'pages/mine/index',
    'pages/selection/index',
    'pages/lucky/index',
    'pages/analysis/index',
    'pages/history/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#EF4444',
    navigationBarTitleText: '全彩选号模拟器',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#666666',
    selectedColor: '#EF4444',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '今日开奖',
        iconPath: 'assets/tabbar/result.png',
        selectedIconPath: 'assets/tabbar/result_active.png'
      },
      {
        pagePath: 'pages/tools/index',
        text: '工具',
        iconPath: 'assets/tabbar/tools.png',
        selectedIconPath: 'assets/tabbar/tools_active.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.png',
        selectedIconPath: 'assets/tabbar/mine_active.png'
      }
    ]
  }
})
