# muti-LangSubGen
调用大语言模型，自动生成多语言字幕

## 项目简介

`muti-LangSubGen` 是一个 Node.js 应用程序，它利用 Google 的 Gemini 大语言模型，自动将 SRT 字幕文件翻译成英文中文双字幕。该工具读取指定输入目录中的 SRT 文件，将字幕文本翻译成中文，并将翻译后的字幕写入输出目录。

## 功能特性

*   **批量翻译:**  自动处理输入目录中的所有 SRT 文件。
*   **使用 Gemini API:**  利用强大的 Gemini 大语言模型进行高质量的翻译。
*   **速率限制:**  实现了请求频率限制，避免因频繁请求而触发 API 错误。
*   **可配置:**  允许用户通过 `.env` 文件配置 API 密钥、代理和批量大小等参数。

## 使用方法

### 1. 前提条件

*   Node.js (建议使用最新版本)
*   npm 或 yarn
*   Google Gemini API 密钥

### 2. 安装

1. 克隆或下载此仓库到本地。
2. 在项目根目录下，复制 `.env.example` 文件并重命名为 `.env`。
3. 编辑 `.env` 文件，填入你的 Google Gemini API 密钥：

    ```
    GEMINI_API_KEY=你的API密钥
    ```

    如果需要使用代理，请配置 `PROXY_URL`：

    ```
    PROXY_URL=http://你的代理地址:端口
    ```

4. 安装项目依赖：

    ```bash
    npm install
    ```

    或者使用 yarn：

    ```bash
    yarn install
    ```

### 3. 运行

1. 将需要翻译的 `.srt` 文件放入 `input` 目录中。
2. 运行以下命令开始翻译：

    ```bash
    node index.js
    ```

3. 翻译完成后，翻译后的 SRT 文件将保存在 `output` 目录中。

## 目录结构
muti-LangSubGen/
├── input/ # 存放待翻译的 SRT 文件
├── output/ # 存放翻译后的 SRT 文件
├── src/
│ ├── core/
│ │ ├── geminiTranslator.js # 调用 Gemini API 进行翻译
│ │ ├── srtParser.js # 解析和写入 SRT 文件
│ │ ├── translator.js # 封装翻译逻辑，处理 API 请求
│ ├── config/
│ │ └── config.js # 加载配置信息
├── .env # 存放环境变量 (API 密钥等)
├── .env.example # .env 文件示例
├── index.js # 项目入口文件
├── package.json
├── package-lock.json
└── README.md


## 核心代码模块

*   `index.js` ([startLine: 1, endLine: 64](index.js)):  项目入口文件，负责读取输入文件，调用翻译模块，并将结果写入输出文件。
*   `src/core/geminiTranslator.js` ([startLine: 1, endLine: 26](src/core/geminiTranslator.js)):  封装了调用 Gemini API 进行翻译的逻辑，并实现了速率限制。
*   `src/core/srtParser.js` ([startLine: 1, endLine: 51](src/core/srtParser.js)):  包含解析 SRT 文件和写入 SRT 文件的功能。
*   `src/core/translator.js` ([startLine: 10, endLine: 63](src/core/translator.js)):  处理与 Gemini API 的通信，发送翻译请求并处理响应。
*   `src/config/config.js` ([startLine: 1, endLine: 23](src/config/config.js)):  加载和管理项目配置信息，例如 API 密钥和代理设置。

## 注意事项

*   请确保你的 `.env` 文件中配置了正确的 Gemini API 密钥。
*   如果网络环境需要，请配置代理以访问 Gemini API。
*   翻译质量取决于 Gemini API 的性能。

## 未来改进方向
*   提供可视化界面；可以直接在网页上上传+下载了！（方便更多不会代码的同学）
*   支持批处理
*   支持更多语言的翻译
*   添加命令行参数，以更灵活地控制输入和输出路径。
*   优化核心 translator 逻辑；当前如果字幕文件换行导致逻辑不顺，其实当前没有做优化。




本项目是俺跟gemini2.0-flash-thinking-exp一起完成的第一个项目，希望能有帮助💗




// 2025.01.30 更新
1. 因为gemini风控，apikey不好使了，所以更新了支持kimi翻译、302中转api；
2. 同时，将部分项目代码更模块化了下，方便更好增加和切换翻译引擎。
3. 增加了翻译文本量、输出文本量、token消耗的简单计算和记录。

