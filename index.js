import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import srtParser from './src/core/srtParser.js';
import config from './src/config/config.js'; 
import geminiTranslator from './src/core/geminiTranslator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');

async function main() {
  try {
    // 确保输出目录存在
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const files = await fs.readdir(INPUT_DIR);
    const srtFiles = files.filter(file => path.extname(file).toLowerCase() === '.srt');

    console.log(`Found ${srtFiles.length} SRT files in ${INPUT_DIR}`);

    for (const filename of srtFiles) {
      const inputFilePath = path.join(INPUT_DIR, filename);
      const outputFilePath = path.join(OUTPUT_DIR, filename);

      console.log(`Processing file: ${filename}`);

      try {
        const subtitles = await srtParser.parseSrt(inputFilePath);
        const batchSize = config.batchSize;
        const translatedSubtitles = [];

        for (let i = 0; i < subtitles.length; i += batchSize) {
          const batch = subtitles.slice(i, i + batchSize);
          const textsToTranslate = batch.map(sub => sub.text);
          try {
            const chineseTexts = await geminiTranslator.translateWithRateLimit(textsToTranslate);
            // 确保翻译结果和原始字幕一一对应
            batch.forEach((subtitle, index) => {
              translatedSubtitles.push({ ...subtitle, chineseText: chineseTexts[index] || '翻译失败' });
            });
          } catch (translateError) {
            console.error(`Error translating batch starting at subtitle ${batch[0]?.index} in ${filename}:`, translateError);
            // 批量翻译失败，将当前批次的字幕标记为翻译失败
            batch.forEach(subtitle => translatedSubtitles.push({ ...subtitle, chineseText: '翻译失败' }));
          }
        }

        await srtParser.writeSrt(outputFilePath, translatedSubtitles);
        console.log(`Finished processing: ${filename}`);

      } catch (parseError) {
        console.error(`Error processing SRT file ${filename}:`, parseError);
      }
    }

    console.log('All SRT files processed.');

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();