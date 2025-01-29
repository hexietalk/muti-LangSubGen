import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import srtParser from './src/core/srtParser.js';
import config from './src/config/config.js'; 
import { createTranslator } from './src/core/index.js';
import statsRecorder from './src/utils/statsRecorder.js';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');

async function main() {
  try {
    const translator = createTranslator(config.translatorType, config);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const files = await fs.readdir(INPUT_DIR);
    const srtFiles = files.filter(file => path.extname(file).toLowerCase() === '.srt');

    for (const filename of srtFiles) {
      const inputFilePath = path.join(INPUT_DIR, filename);
      const outputFilePath = path.join(OUTPUT_DIR, filename);

      console.log(`Processing file: ${filename}`);
      const subtitles = await srtParser.parseSrt(inputFilePath);
      const translatedSubtitles = [];
      const batchSize = config.batchSize || 5;

      for (let i = 0; i < subtitles.length; i += batchSize) {
        const batch = subtitles.slice(i, i + batchSize);
        const textsToTranslate = batch.map(sub => sub.text);
        try {
          const startTime = Date.now();  // 记录开始时间
          const chineseTexts = await translator.translateWithRateLimit(textsToTranslate);
          
          // 记录统计信息
          await statsRecorder.recordStats({
            startTime,
            endTime: Date.now(),
            inputTexts: textsToTranslate,
            outputTexts: chineseTexts,
            batchSize,
            translatorType: config.translatorType,
            fileName: filename  // 传入文件名
          });

          batch.forEach((subtitle, index) => {
            translatedSubtitles.push({ ...subtitle, chineseText: chineseTexts[index] || '翻译失败' });
          });
        } catch (translateError) {
          console.error(`Error translating batch in ${filename}:`, translateError);
          batch.forEach(subtitle => translatedSubtitles.push({ ...subtitle, chineseText: '翻译失败' }));
        }
      }

      await srtParser.writeSrt(outputFilePath, translatedSubtitles);
      console.log(`Finished processing: ${filename}`);
    }

    console.log('All SRT files processed.');

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();