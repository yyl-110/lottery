import { SingletonProto, AccessLevel } from '@eggjs/tegg';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { LotteryResult, LotteryType } from '../interface/types';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class LotteryService {
  private parseNumbers(text: string): number[] {
    return (text.match(/\d+/g) || []).map(Number);
  }

  /**
   * 从中彩网 (zhcw.com) 抓取福彩数据
   */
  async getResultsFromZhcw(type: LotteryType, page: number = 1): Promise<LotteryResult[]> {
    const typeMap = {
      ssq: 'ssq',
      '3d': '3d',
      qlc: 'qlc',
    };
    
    if (!typeMap[type]) {
      throw new Error(`Zhcw crawler does not support ${type}`);
    }

    const url = `http://kaijiang.zhcw.com/zhcw/html/${typeMap[type]}/list_${page}.html`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results: LotteryResult[] = [];

      $('table.wqhgt tr').each((i, el) => {
        if (i < 2) return;
        const tds = $(el).find('td');
        if (tds.length < 3) return;

        const date = $(tds[0]).text().trim();
        const issue = $(tds[1]).text().trim();
        const selections: number[][] = [];
        
        if (type === 'ssq') {
          const cell = $(tds[2]);
          const allNumbers: number[] = [];
          cell.find('em').each((_, em) => {
            allNumbers.push(...this.parseNumbers($(em).text()));
          });
          if (allNumbers.length === 0) {
            allNumbers.push(...this.parseNumbers(cell.text()));
          }
          let reds: number[] = [];
          cell.find('em.rr').each((_, em) => {
            reds.push(...this.parseNumbers($(em).text()));
          });

          if (reds.length < 6 && allNumbers.length >= 7) {
            reds = allNumbers.slice(0, 6);
          }

          const blueText = cell.find('em.bb, em.blue, .bb, .blue').last().text();
          let blue = this.parseNumbers(blueText)[0];
          if (!blue && allNumbers.length >= 7) {
            blue = allNumbers[6];
          }

          if (reds.length < 6 || !blue) return;
          selections.push(reds.sort((a, b) => a - b));
          selections.push([blue]);
        } else if (type === '3d') {
          const nums: number[] = [];
          $(tds[2]).find('em.rr').each((_, em) => {
            nums.push(...this.parseNumbers($(em).text()));
          });
          nums.forEach(n => selections.push([n]));
        } else if (type === 'qlc') {
          let reds: number[] = [];
          $(tds[2]).find('em.rr').each((_, em) => {
            reds.push(...this.parseNumbers($(em).text()));
          });
          if (reds.length < 7) {
            const nums: number[] = [];
            $(tds[2]).find('em').each((_, em) => {
              nums.push(...this.parseNumbers($(em).text()));
            });
            reds = (nums.length > 0 ? nums : this.parseNumbers($(tds[2]).text())).slice(0, 7);
          }
          if (reds.length < 7) return;
          selections.push(reds.sort((a, b) => a - b));
        }

        const sales = $(tds[3]).text().trim().replace(/,/g, '');
        
        results.push({
          id: type,
          name: this.getLotteryName(type),
          issue,
          date,
          sales: (Number(sales) / 100000000).toFixed(2),
          selections,
        });
      });

      return results;
    } catch (err: any) {
      console.error(`Failed to crawl ${type} from Zhcw:`, err.message);
      throw err;
    }
  }

  /**
   * 从中国体彩网 (sporttery.cn) 获取体彩数据
   */
  async getResultsFromSporttery(type: LotteryType, count: number = 20): Promise<LotteryResult[]> {
    const gameNoMap = {
      dlt: '85',
      pls: '35',
      plw: '3501',
      qxc: '04',
    };

    if (!gameNoMap[type]) {
      throw new Error(`Sporttery API does not support ${type}`);
    }

    const url = `https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=${gameNoMap[type]}&provinceId=0&pageSize=${count}&isVerify=1&pageNo=1`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Referer': 'https://static.sporttery.cn/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      if (response.data && response.data.success && response.data.value && response.data.value.list) {
        return response.data.value.list.map((item: any) => {
          const rawResult = item.lotteryDrawResult; // "01 02 03 04 05 + 06 07" or "6 5 6"
          let selections: number[][] = [];

          if (type === 'dlt') {
            const parts = rawResult.split(' + ');
            const front = parts[0].split(' ').map(Number);
            const back = parts[1].split(' ').map(Number);
            selections = [front, back];
          } else if (type === 'pls' || type === 'plw' || type === 'qxc') {
            const nums = rawResult.split(' ').map(Number);
            nums.forEach((n: number) => selections.push([n]));
          }

          return {
            id: type,
            name: item.lotteryGameName || this.getLotteryName(type),
            issue: item.lotteryDrawNum,
            date: item.lotteryDrawTime,
            sales: item.totalSaleAmount ? (Number(item.totalSaleAmount.replace(/,/g, '')) / 100000000).toFixed(2) : '0.00',
            selections,
          };
        });
      }
    } catch (err: any) {
      console.error(`Failed to fetch ${type} from Sporttery:`, err.message);
      throw err;
    }
    return [];
  }

  async getLotteryResults(type: LotteryType, count: number = 20): Promise<LotteryResult[]> {
    const fucaiTypes: LotteryType[] = ['ssq', '3d', 'qlc'];
    const ticaiTypes: LotteryType[] = ['dlt', 'pls', 'plw', 'qxc'];

    try {
      if (fucaiTypes.includes(type)) {
        return await this.getResultsFromZhcw(type);
      } else if (ticaiTypes.includes(type)) {
        return await this.getResultsFromSporttery(type, count);
      }
    } catch (err) {
      console.warn(`Primary source failed for ${type}, using mock fallback...`);
    }

    return this.getResultsFromMock(type, count);
  }

  private getResultsFromMock(type: LotteryType, count: number): LotteryResult[] {
    const results: LotteryResult[] = [];
    for (let i = 0; i < count; i++) {
      results.push({
        id: type,
        name: this.getLotteryName(type),
        issue: '2026' + String(i).padStart(3, '0'),
        date: '2026-04-29',
        sales: '0.00',
        selections: [[1, 2, 3], [4]],
      });
    }
    return results;
  }

  private getLotteryName(type: string): string {
    const names = {
      ssq: '双色球',
      '3d': '福彩3D',
      qlc: '七乐彩',
      kl8: '快乐8',
      dlt: '大乐透',
      pls: '排列三',
      plw: '排列五',
      qxc: '七星彩',
    };
    return names[type] || type;
  }
}
