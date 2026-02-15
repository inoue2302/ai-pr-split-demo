# ai-pr-split-demo

AI時代のPR分割方法を解説する記事のサンプルプロジェクトです。
Hono.js + Node.js による Todo REST API を題材にしています。

## Tech Stack

- [Hono](https://hono.dev/) — 軽量 Web フレームワーク
- Node.js + TypeScript (ESM)
- データはインメモリ管理

## Getting Started

```bash
npm install
npm run dev
```

開発サーバーが `http://localhost:3000` で起動します。

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/todos` | Todo 一覧取得 |
| POST | `/api/todos` | Todo 作成 |
| PUT | `/api/todos/:id` | Todo 更新 |
| DELETE | `/api/todos/:id` | Todo 削除 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 開発サーバー起動（ホットリロード） |
| `npm run build` | TypeScript コンパイル |
| `npm start` | ビルド済み JS の実行 |
