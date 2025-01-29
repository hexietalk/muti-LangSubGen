import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

const config = {
  thirdPartyApiKey: process.env.THIRD_PARTY_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  proxyUrl: process.env.PROXY_URL, // 如果你需要配置代理，可以在 .env 文件中添加 PROXY_URL
  maxRequestsPerMinute: 40, // 每分钟最大请求次数
  batchSize: 10, // 每次翻译的句子数量
  kimiApiKey: process.env.KIMI_API_KEY,
  translatorType: process.env.TRANSLATOR_TYPE || 'kimi', // 'gemini' 或 'kimi' 或 'thirdParty'

};

console.log('Configuration loaded:', Object.keys(config));
console.log('config.geminiApiKey:', config.geminiApiKey);

export default config;