import OpenAI from 'openai';
import BaseTranslator from './base.js';

class KimiTranslator extends BaseTranslator {
  constructor(config) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.kimiApiKey,
      baseURL: "https://api.moonshot.cn/v1",
    });
  }

  async _doTranslate(texts) {
    console.log('开始 Kimi 批量翻译，共 %d 句文本', texts.length);
    
    try {
      // 将所有文本组合成一个请求，每行前加上编号
      const numberedTexts = texts.map((text, index) => `${index + 1}. ${text}`).join('\n');
      console.log('\n待翻译文本:\n', numberedTexts);

      const completion = await this.client.chat.completions.create({
        model: "moonshot-v1-auto",
        messages: [
          {
            role: "system",
            content: 
            `你是一名专业编程课程的字幕翻译员，请严格遵守以下规则：
1. 必须保持原有编号结构，逐行原文、译文，对应翻译
2. 即使遇到空行或单字行也需保留编号
3. 必须输出与输入完全相同的行数
4. 输出格式严格遵循："编号. 译文"（如：1. 你好）
5. 禁止合并内容、拆分或省略任何行内文本
6. 如果遇到无法翻译的内容（如代码、专有名词），直接保留原文

现在请翻译以下内容：`
          },
          {
            role: "user",
            content: numberedTexts
          }
        ],
        temperature: 0.1,  // 降低随机性
        top_p: 0.3,
        frequency_penalty: 0.5
      });
      
      const translatedText = completion.choices[0].message.content;
      console.log('原始翻译结果:\n', translatedText);

      // 增强解析逻辑
      const translatedLines = this._parseTranslationResult(translatedText, texts.length);

      if (translatedLines.length !== texts.length) {
        console.warn('首次解析未通过，启动备用解析方案...');
        const backupLines = this._backupParse(translatedText, texts.length);
        return backupLines.length === texts.length 
          ? backupLines 
          : this._fallbackCompensation(texts, backupLines);
      }

      console.log('\n处理后的翻译结果:', translatedLines);
      return translatedLines;
      
    } catch (error) {
      console.error("Kimi 翻译错误:", error.message);
      if (error.error?.type === 'rate_limit_reached_error') {
        console.log('触发频率限制，等待 1 秒后重试...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this._doTranslate(texts);
      }
      return this._fallbackCompensation(texts, []);
    }
  }

  // 主解析方法
  _parseTranslationResult(translatedText, expectedLength) {
    return translatedText
      .split(/(\d+\.)/g) // 智能分割编号
      .reduce((acc, part, index, arr) => {
        if (index % 2 === 1) { // 提取编号和对应内容
          const content = arr[index+1] ? arr[index+1].split('\n')[0] : '';
          acc.push(`${part}${content}`.replace(/^\s*\d+[\.。]\s*/, '').trim());
        }
        return acc;
      }, [])
      .filter(line => line !== '');
  }

  // 备用解析方案
  _backupParse(translatedText, expectedLength) {
    const backupLines = translatedText.match(/\d+\..*?(?=\s*\d+\.|$)/gs) || [];
    return backupLines.map(line => 
      line.replace(/^\s*\d+[\.。]\s*/, '').trim()
    );
  }

  // 最终补偿机制
  _fallbackCompensation(originalTexts, translatedLines) {
    return originalTexts.map((text, index) => {
      return translatedLines[index] || `[待修正]${text}`;
    });
  }
}

export default KimiTranslator;