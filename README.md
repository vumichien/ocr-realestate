# Detomo OCR

モダンスタイルで作られた日本語不動産文書のOCRアプリケーション。Vue.js と Vuetify を使用して構築されています。

## 機能

- PDFファイルのアップロードと表示
- ページ単位でのPDFドキュメントの閲覧
- OpenAI GPT-4.1-mini を利用した情報抽出
- カスタマイズ可能な抽出フィールド
- ユーザーフレンドリーなインターフェース

## デフォルト抽出フィールド

- 物件種目
- マンション名
- 最寄駅
- 間取り/タイプ
- 価格
- 物件
- 所在地

## 提案される追加フィールド

- 構造・規模
- 専有居住
- 築年月
- 管理会社

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build
```

## 環境変数

アプリケーションを実行する前に、`.env` ファイルにOpenAI APIキーを設定してください。

```
VITE_OPENAI_API_KEY=your_openai_api_key
```

## 技術スタック

- Vue 3 (Composition API)
- Vuetify 3
- PDF.js (PDFレンダリング)
- OpenAI API (GPT-4.1-mini)
- Axios (APIリクエスト)

## 使用方法

1. PDFファイルをアップロードします
2. 抽出したい情報フィールドを選択します
3. 「OCR処理を実行」ボタンをクリックします
4. 抽出された情報が右側のパネルに表示されます

---

# Detomo OCR

A modern-style OCR application for Japanese real estate documents, built with Vue.js and Vuetify.

## Features

- Upload and display PDF files
- Browse PDF documents page by page
- Information extraction using OpenAI GPT-4.1-mini
- Customizable extraction fields
- User-friendly interface

## Default Extraction Fields

- Property Type (物件種目)
- Building Name (マンション名)
- Nearest Station (最寄駅)
- Layout/Type (間取り/タイプ)
- Price (価格)
- Property (物件)
- Address (所在地)

## Suggested Additional Fields

- Structure/Scale (構造・規模)
- Private Area (専有居住)
- Construction Year/Month (築年月)
- Management Company (管理会社)

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Set your OpenAI API key in the `.env` file before running the application.

```
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Technology Stack

- Vue 3 (Composition API)
- Vuetify 3
- PDF.js (PDF rendering)
- OpenAI API (GPT-4.1-mini)
- Axios (API requests)

## Usage

1. Upload a PDF file
2. Select the information fields you want to extract
3. Click the "Run OCR Process" button
4. The extracted information will be displayed in the right panel
