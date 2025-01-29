import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import BaseTranslator from './base.js';

class GeminiTranslator extends BaseTranslator {
  constructor(config) {
    super(config);
    this.MODEL_NAME = 'gemini-2.0-flash-exp';
    this.PROMPT_TEMPLATE = '翻译成中文；只输出结果，不做任何解释。\n';
    this.proxyAgent = config.proxyUrl ? new HttpsProxyAgent(config.proxyUrl) : undefined;
  }

  async _doTranslate(texts) {
    const numberedTexts = texts.map((text, index) => {
      const numberedText = `${index + 1}. ${this.PROMPT_TEMPLATE}${text}`;
      console.log(numberedText);
      return numberedText;
    });
    const combinedText = numberedTexts.join('\n');

    if (!this.config.geminiApiKey) {
      console.error('Gemini API Key is missing. Please check your .env file.');
      throw new Error('Gemini API Key is missing.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL_NAME}:generateContent?key=${this.config.geminiApiKey}`;
    const payload = {
      contents: [{ parts: [{ text: combinedText }] }],
    };

    try {
      console.log(`Translating ${texts.length} sentences...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        agent: this.proxyAgent,
      });

      if (!response.ok) {
        console.error(`Gemini API error: ${response.status} ${response.statusText}`);
        const errorDetails = await response.text();
        console.error('Error details:', errorDetails);
        throw new Error(`Gemini API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const translatedText = data.candidates[0].content.parts[0].text;
        console.log('Raw translated text from Gemini:');
        console.log(translatedText);
        
        const translatedSentences = translatedText.split('\n').filter(line => line.trim() !== '');
        console.log('Split translated sentences:');
        translatedSentences.forEach((sentence, index) => {
          console.log(`${index + 1}. ${sentence}`);
        });

        if (translatedSentences.length !== texts.length) {
          console.error('翻译结果数量与原文不符');
          return texts.map(() => '翻译失败');
        }

        console.log('Translation results:', translatedSentences);
        return translatedSentences;
      } else {
        console.error('Unexpected response format from Gemini API:', data);
        throw new Error('Unexpected response format from Gemini API');
      }
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }
}

export default GeminiTranslator;