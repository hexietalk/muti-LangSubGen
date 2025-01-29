import GeminiTranslator from './gemini.js';
import KimiTranslator from './kimi.js';
import ThirdPartyTranslator from './thirdPartyTranslator.js';

function createTranslator(type, config) {
    
  switch (type.toLowerCase()) {
    case 'thirdparty':
        return new ThirdPartyTranslator(config);  
    case 'gemini':
      return new GeminiTranslator(config);
    case 'kimi':
      return new KimiTranslator(config);
    default:
      throw new Error(`不支持的翻译器类型: ${type}`);
  }
}

export { createTranslator };