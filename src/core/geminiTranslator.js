import config from '../config/config.js';
import translator from './translator.js';

const REQUEST_HISTORY = [];

async function translateWithRateLimit(texts) {
  const now = Date.now();
  REQUEST_HISTORY.push(now);

  // 清理超过 1 分钟的请求记录
  while (REQUEST_HISTORY.length > 0 && REQUEST_HISTORY[0] < now - 60000) {
    REQUEST_HISTORY.shift();
  }

  if (REQUEST_HISTORY.length > config.maxRequestsPerMinute) {
    const waitTime = 60000 - (now - REQUEST_HISTORY[0]);
    console.log(`达到频率限制，等待 ${waitTime / 1000} 秒...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    // 在等待后，需要再次尝试发送请求
    return translateWithRateLimit(texts);
  }

  return translator.translateTexts(texts);
}

export default { translateWithRateLimit };