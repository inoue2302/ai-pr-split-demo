---
name: issue
description: 機能の説明から要件解析・分割計画・親Issue+sub-issue作成を行う
argument-hint: <機能の説明>
allowed-tools: Read, Grep, Glob, Bash(gh *), Bash(git *)
---

# /issue コマンド

機能の説明を受け取り、要件解析→分割計画→ユーザー承認→親Issue+sub-issue作成を行います。

## 入力

- `$ARGUMENTS`: 実装したい機能の概要（自然言語）

## 手順

### 1. 要件解析

`$ARGUMENTS` から以下を抽出する:

- 機能スコープ（何を実現するか）
- 技術要件（使用するライブラリ、API設計、データ構造など）
- CLAUDE.md の既存アーキテクチャとの整合性

現在のコードベースを Glob / Grep / Read で確認し、既存の構造を把握する。

### 2. レイヤー分割に基づく分割計画の策定

以下の基準で sub-issue に分割する:

- **レイヤーごとに切る**（ルーティング、ロジック、データ層など）
- **1PR あたり 40〜60行目安**
- **3〜5個の sub-issue に収める**
- 各 sub-issue が独立してレビュー可能な粒度にする

### 3. 分割計画をユーザーに提示

以下の形式で計画を提示し、**ユーザーの承認を得る**:

```
## 分割計画

親Issue: {機能名}（全体計画）

| # | sub-issue | 概要 | PR目安 |
|---|----------|------|--------|
| 1 | {タイトル} | {スコープ} | 〜XX行 |
| 2 | {タイトル} | {スコープ} | 〜XX行 |
| 3 | {タイトル} | {スコープ} | 〜XX行 |
| ... | ... | ... | ... |

この計画で Issue を作成してよろしいですか？
```

**ユーザーの承認を得てから次のステップに進むこと。**

### 4. 親Issue の作成

```bash
gh issue create \
  --repo inoue2302/ai-pr-split-demo \
  --title "{機能名}" \
  --body "{全体計画の本文}" \
  --label "planning"
```

親Issue の本文には以下を含める:

```markdown
## 概要
{機能の説明}

## 技術スタック
{使用する技術・ライブラリ}

## 分割方針
{レイヤー分割の方針}

## sub-issues
- [ ] [1/N] {sub-issue 1 タイトル}
- [ ] [2/N] {sub-issue 2 タイトル}
- ...
```

### 5. sub-issue の作成

各 sub-issue を依存順に作成する:

```bash
gh issue create \
  --repo inoue2302/ai-pr-split-demo \
  --title "[1/N] {sub-issue タイトル}" \
  --body "{sub-issue 本文}"
```

各 sub-issue の本文には以下を含める:

```markdown
## 概要
このsub-issueの実装スコープ

## 親Issue
#{親Issue番号} {親Issueタイトル}

## 依存関係
- 前提: なし（1番目） / #{前のsub-issue番号} の完了後に着手（2番目以降）

## 実装スコープ
- [ ] 具体的なタスク1
- [ ] 具体的なタスク2

## 受け入れ基準
- 条件1
- 条件2

## PR目安
〜XX行
```

### 6. sub-issue の紐付け

GitHub sub-issues 機能で親Issue に紐付ける:

```bash
gh issue edit {親Issue番号} --repo inoue2302/ai-pr-split-demo --add-sub-issue {sub-issue番号}
```

### 7. 結果サマリーの表示

```
## Issue 作成完了

親Issue: #{番号} {タイトル}

| # | sub-issue | 番号 | 依存 |
|---|----------|------|------|
| 1 | {タイトル} | #{番号} | なし |
| 2 | {タイトル} | #{番号} | #{前の番号} |
| ... | ... | ... | ... |

次のステップ: `/implement {親Issue番号}` で実装を開始できます。
```

## 注意事項

- 分割計画は必ずユーザーの承認を得てから Issue を作成する
- sub-issue の依存関係（実装順序）を明確にする
- 各 sub-issue の実装スコープは具体的かつ過不足なく記載する
- 日本語で Issue を作成する
