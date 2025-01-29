import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StatsRecorder {
  constructor() {
    this.statsFile = path.join(__dirname, '../../logs/translation_stats.csv');
  }

  async recordStats(stats) {
    if (!stats) return;

    try {
      const {
        startTime,
        endTime,
        inputTexts,
        outputTexts,
        batchSize,
        translatorType,
        fileName 
      } = stats;

      // 添加安全检查
      if (!Array.isArray(inputTexts) || !Array.isArray(outputTexts)) {
        console.warn('统计数据格式不正确，跳过记录');
        return;
      }
      // 计算统计数据
      const timestamp = new Date().toISOString();
      const duration = (endTime - startTime) / 1000;
      const textCount = inputTexts.length;
      const inputChars = inputTexts.join('').length;
      const outputChars = outputTexts.join('').length;
      const inputTokens = this.estimateTokens(inputTexts.join(''));
      const outputTokens = this.estimateTokens(outputTexts.join(''));
      const totalTokens = inputTokens + outputTokens;
      const speed = (textCount / duration).toFixed(2);

      // CSV 头部字段
      const headers = [
        'timestamp',
        'file_name',     // 新增文件名字段
        'translator_type',
        'batch_size',
        'duration_seconds',
        'text_count',
        'input_chars',
        'input_tokens',
        'output_chars',
        'output_tokens',
        'total_tokens',
        'texts_per_second'
      ].join(',');

      // CSV 数据行
      const data = [
        timestamp,
        fileName || 'unknown',  // 新增文件名数据
        translatorType,
        batchSize,
        duration.toFixed(2),
        textCount,
        inputChars,
        inputTokens,
        outputChars,
        outputTokens,
        totalTokens,
        speed
      ].join(',');

      // 确保 logs 目录存在
      const logsDir = path.dirname(this.statsFile);
      await fs.mkdir(logsDir, { recursive: true });

      // 检查文件是否存在
      let fileExists = false;
      try {
        await fs.access(this.statsFile);
        fileExists = true;
      } catch {
        fileExists = false;
      }

      // 如果文件不存在，先写入表头
      if (!fileExists) {
        await fs.writeFile(this.statsFile, headers + '\n', 'utf-8');
        console.log('创建新的统计文件:', this.statsFile);
      }

      // 追加数据
      await fs.appendFile(this.statsFile, data + '\n', 'utf-8');
      console.log('统计数据已记录到:', this.statsFile);

      // 更新控制台输出，包含文件名
      console.log(`
翻译统计:
- 文件: ${fileName || 'unknown'}
- 时间: ${timestamp}
- 类型: ${translatorType}
- 批次: ${batchSize}
- 耗时: ${duration.toFixed(2)}秒
- 数量: ${textCount}条
- Token: ${totalTokens}
- 速度: ${speed}条/秒
      `);

    } catch (error) {
      console.error('记录统计信息时出错（不影响翻译）:', error);
    }
  }
}

const statsRecorder = new StatsRecorder();
export default statsRecorder;  // 使用 export default