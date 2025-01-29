import fetch from 'node-fetch';
import BaseTranslator from './base.js';

class ThirdPartyTranslator extends BaseTranslator {
  constructor(config) {
    super(config);
    this.API_URL = 'https://api.302.ai/chat/completions';  // 替换为实际的 API URL
  }

  async _doTranslate(texts) {
    console.log('开始 302.ai 批量翻译，共 %d 句文本', texts.length);
    
    try {
      const numberedTexts = texts.map((text, index) => `${index + 1}. ${text}`).join('\n');
      console.log('\n待翻译文本:\n', numberedTexts);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.config.thirdPartyApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash-thinking-exp-1219",
          messages: [
            {
              role: "system",
              content: `你是一名专业编程课程的字幕翻译员，请严格遵守以下规则：
1. 必须保持原有编号结构，逐行原文、译文，对应翻译
2. 即使遇到空行或单字行也需保留编号
3. 必须输出与输入完全相同的行数
4. 输出格式严格遵循："编号. 译文"（如：1. 你好）
5. 禁止合并内容、拆分或省略任何行内文本
6. 如果遇到无法翻译的内容（如代码、专有名词），直接保留原文
7. 输入格式严格按照："编号. 原文"（如：1. 你好 /n）
`
            },
            {
              role: "user",
              content: numberedTexts
            }
          ]
        })
      });

      if (!response.ok) {
        console.error('API 错误响应:', errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content || 
      data.message?.content || 
      data.content || 
      '';
console.log('原始翻译结果:\n', translatedText);

      // 复用 Kimi 翻译器的解析逻辑
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
      console.error("302.ai 翻译错误:", error.message);
      return this._fallbackCompensation(texts, []);
    }
  }

  // 复用 Kimi 翻译器的解析方法
  _parseTranslationResult(translatedText, expectedLength) {
    return translatedText
      .split(/(\d+\.)/g)
      .reduce((acc, part, index, arr) => {
        if (index % 2 === 1) {
          const content = arr[index+1] ? arr[index+1].split('\n')[0] : '';
          acc.push(`${part}${content}`.replace(/^\s*\d+[\.。]\s*/, '').trim());
        }
        return acc;
      }, [])
      .filter(line => line !== '');
  }

  _backupParse(translatedText, expectedLength) {
    const backupLines = translatedText.match(/\d+\..*?(?=\s*\d+\.|$)/gs) || [];
    return backupLines.map(line => 
      line.replace(/^\s*\d+[\.。]\s*/, '').trim()
    );
  }

  _fallbackCompensation(originalTexts, translatedLines) {
    return originalTexts.map((text, index) => {
      return translatedLines[index] || `[待修正]${text}`;
    });
  }
}

export default ThirdPartyTranslator;