# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI時代のPR分割方法を解説する記事のためのサンプルプロジェクト。
Hono.js + Node.js によるTodo REST API。データはインメモリ管理。

## Commands

- `npm run dev` — 開発サーバー起動（tsx watchによるホットリロード、port 3000）
- `npm run build` — TypeScriptコンパイル（出力先: dist/）
- `npm start` — ビルド済みJSの実行
- `npx tsc --noEmit` — 型チェックのみ

## Architecture

- `src/index.ts` — サーバー起動エントリポイント（@hono/node-server）
- `src/app.ts` — Honoアプリ生成とルーティングマウント
- `src/routes/todos.ts` — Todo CRUD（GET/POST/PUT/DELETE `/api/todos`）

ルーティングは `app.route()` でサブアプリをマウントする構成。新しいリソースを追加する場合は `src/routes/` にファイルを作り `app.ts` でマウントする。

## Conventions

- ESM（`"type": "module"`）、importの拡張子は `.js`
- TypeScript strict mode有効
