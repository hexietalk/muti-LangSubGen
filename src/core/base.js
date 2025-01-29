import statsRecorder from '../utils/statsRecorder.js';

class BaseTranslator {
    constructor(config) {
      this.config = config;
      this.REQUEST_HISTORY = [];
    }
  
    async translateWithRateLimit(texts) {
      const now = Date.now();
      this.REQUEST_HISTORY.push(now);
  
      // 清理超过 1 分钟的请求记录
      while (this.REQUEST_HISTORY.length > 0 && this.REQUEST_HISTORY[0] < now - 60000) {
        this.REQUEST_HISTORY.shift();
      }
  
      if (this.REQUEST_HISTORY.length > this.config.maxRequestsPerMinute) {
        const waitTime = 60000 - (now - this.REQUEST_HISTORY[0]);
        console.log(`达到频率限制，等待 ${waitTime / 1000} 秒...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.translateWithRateLimit(texts);
      }
  
      return this.translate(texts);
    }
  
    async translate(texts) {
        if (!Array.isArray(texts) || texts.length === 0) {
          return [];
        }
        
        const startTime = Date.now();
        console.log(`准备翻译 ${texts.length} 句话:`);
        
        // 先完成翻译
        const translatedTexts = await this._doTranslate(texts);
        
        // 尝试记录统计信息，但不影响翻译结果
        try {
          await statsRecorder.recordStats({
            startTime,
            endTime: Date.now(),
            inputTexts: texts,
            outputTexts: translatedTexts,
            batchSize: this.config.batchSize,
            translatorType: this.config.translatorType
          }).catch(error => {
            console.error('统计记录失败，但不影响翻译:', error);
          });
        } catch (error) {
          console.error('统计记录失败，但不影响翻译:', error);
        }
    
        return translatedTexts;
      }
  
    async _doTranslate(texts) {
      throw new Error('_doTranslate method must be implemented');
    }
  }
  
  export default BaseTranslator;