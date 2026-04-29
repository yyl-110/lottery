import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPParam } from '@eggjs/tegg';
import { Inject } from '@eggjs/tegg';
import { LotteryService } from '../service/LotteryService';
import { LotteryType } from '../interface/types';

@HTTPController({
  path: '/api/lottery',
})
export class LotteryController {
  @Inject()
  private lotteryService: LotteryService;

  // 前端 ID 到 后端爬虫 ID 的转换
  private mapType(type: string): LotteryType {
    const map = {
      'fc3d': '3d',
      'pl3': 'pls',
      'pl5': 'plw',
    };
    return (map[type] || type) as LotteryType;
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/results/:type',
  })
  async getResults(@HTTPParam({ name: 'type' }) type: string) {
    const backendType = this.mapType(type);
    const validTypes: LotteryType[] = ['ssq', '3d', 'qlc', 'kl8', 'dlt', 'pls', 'plw', 'qxc'];
    
    if (!validTypes.includes(backendType)) {
      return {
        success: false,
        message: `Invalid lottery type: ${type}`,
      };
    }

    try {
      const results = await this.lotteryService.getLotteryResults(backendType);
      // 将结果中的 ID 还原为前端期望的 ID
      const mappedResults = results.map(r => ({
        ...r,
        id: type, // 保持前端传入的 ID
      }));

      return {
        success: true,
        data: mappedResults,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message,
      };
    }
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/latest',
  })
  async getLatest() {
    // 按照前端定义的 ID 列表进行抓取
    const frontendTypes = ['ssq', 'fc3d', 'qlc', 'kl8', 'dlt', 'pl3', 'pl5', 'qxc'];
    try {
      const promises = frontendTypes.map(async (fType) => {
        const bType = this.mapType(fType);
        const results = await this.lotteryService.getLotteryResults(bType, 1);
        if (results && results.length > 0) {
          const latest = results[0];
          return {
            ...latest,
            id: fType, // 还原为前端 ID
          };
        }
        return null;
      });

      const latestResults = (await Promise.all(promises)).filter(Boolean);
      
      return {
        success: true,
        data: latestResults,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message,
      };
    }
  }
}
