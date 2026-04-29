import Taro from '@tarojs/taro'

export interface LotteryResult {
  id: string
  name: string
  issue: string
  date: string
  sales: string
  selections: number[][]
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

const API_BASE_URL = 'http://127.0.0.1:7001'

const normalizeLotteryId = (id: string) => {
  const map: Record<string, string> = {
    pl3: 'pls',
    pl5: 'plw',
  }

  return map[id] || id
}

const request = async <T>(url: string): Promise<T> => {
  const res = await Taro.request<ApiResponse<T>>({
    url: `${API_BASE_URL}${url}`,
    method: 'GET',
  })

  const body = res.data
  if (!body || !body.success || !body.data) {
    throw new Error(body?.message || '接口请求失败')
  }

  return body.data
}

const normalizeResult = (item: LotteryResult): LotteryResult => ({
  ...item,
  id: normalizeLotteryId(item.id),
})

export const lotteryService = {
  async getLatestResults(): Promise<LotteryResult[]> {
    const results = await request<LotteryResult[]>('/api/lottery/latest')
    return results.map(normalizeResult)
  },

  async getResults(type: string): Promise<LotteryResult[]> {
    const results = await request<LotteryResult[]>(`/api/lottery/results/${type}`)
    return results.map(normalizeResult)
  },
}
