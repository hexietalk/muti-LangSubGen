import fetch from 'node-fetch';
import config from '../config/config.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

const MODEL_NAME = 'gemini-2.0-flash-exp';
const PROMPT_TEMPLATE = '翻译成中文；只输出结果，不做任何解释。\n';

const proxyAgent = config.proxyUrl ? new HttpsProxyAgent(config.proxyUrl) : undefined;

async function translateTexts(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }
  
    console.log(`准备翻译 ${texts.length} 句话:`);
    const numberedTexts = texts.map((text, index) => {
      const numberedText = `${index + 1}. ${PROMPT_TEMPLATE}${text}`;
      console.log(numberedText);
      return numberedText;
    });
    const combinedText = numberedTexts.join('\n');
  
    if (!config.geminiApiKey) {
      console.error('Gemini API Key is missing. Please check your .env file.');
      throw new Error('Gemini API Key is missing.');
    }
  
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${config.geminiApiKey}`;
  
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
        agent: proxyAgent,
      });
  
      if (!response.ok) {
        console.error(`Gemini API error: ${response.status} ${response.statusText}`);
        const errorDetails = await response.text();
        console.error('Error details:', errorDetails);
        throw new Error(`Gemini API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Gemini API response:', data);
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
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
          return texts.map(() => '翻译失败'); // 返回与原文数量相同的错误提示
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


  
export default { translateTexts };