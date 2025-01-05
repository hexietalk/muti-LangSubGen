import geminiTranslator from './src/core/geminiTranslator.js';

async function testGeminiTranslator() {
  const testText = "This is a test sentence to be translated.";

  try {
    console.log(`Sending text to translator: "${testText}"`);
    const translatedText = await geminiTranslator.translateText(testText);
    console.log('Translated text:', translatedText);
  } catch (error) {
    console.error('Translation test failed:', error);
  }
}

testGeminiTranslator();