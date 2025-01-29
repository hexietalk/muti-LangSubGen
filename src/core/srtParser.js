import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function parseSrt(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const subtitles = [];
    let i = 0;

    while (i < lines.length) {
      const index = parseInt(lines[i++]);
      if (isNaN(index)) continue; // 忽略非数字行

      const timecode = lines[i++];
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i++]);
      }
      const text = textLines.join('\n');

      subtitles.push({ index, timecode, text });
      i++; // 跳过空行
    }

    console.log(`SRT file parsed: ${path.basename(filePath)}, ${subtitles.length} subtitles found.`); // 添加 console 输出
    return subtitles;
  } catch (error) {
    console.error(`Error parsing SRT file ${filePath}:`, error);
    throw error;
  }
}

async function writeSrt(filePath, subtitles) {
  try {
    const outputLines = subtitles.map(sub => {
        let chineseText = sub.chineseText || '';
        // 去除编号，例如 "1. " 或 "12. "
        chineseText = chineseText.replace(/^\d+\.\s*/, '');
        chineseText = chineseText ? `\n${chineseText}` : '';
        return `${sub.index}\n${sub.timecode}\n${sub.text}${chineseText}\n\n`;
      });
    const outputPath = path.join(__dirname, '../../output', path.basename(filePath));
    await fs.writeFile(outputPath, outputLines.join(''), 'utf-8');
    console.log(`SRT file written: ${outputPath}`); // 添加 console 输出
  } catch (error) {
    console.error(`Error writing SRT file ${filePath}:`, error);
    throw error;
  }
}

const srtParser = { parseSrt, writeSrt };
export default srtParser;