import { createApp } from 'vue'
import './app.scss'

const App = createApp({
  onShow (options) {},
  // 入口组件不需要实现 render 方法，即使拼写出来也会被 taro 所覆盖
})

export default App
