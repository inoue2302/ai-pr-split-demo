---
name: implement
description: 親Issueのsub-issuesを順次実装し、数珠繋ぎPRを作成する
argument-hint: <親Issue番号>
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(gh *), Bash(git *), Bash(npm *), Bash(npx *)
---

# /implement コマンド

親Issue番号を受け取り、sub-issues を依存順に実装し、数珠繋ぎの PR を作成します。

## 入力

- `$ARGUMENTS`: `/issue` で作成した親Issueの番号

## 手順

### 1. 親Issue の読み込み

```bash
gh issue view $ARGUMENTS --repo inoue2302/ai-pr-split-demo --json number,title,body,labels
```

全体方針・分割計画・技術スタックを把握する。

### 2. sub-issues 一覧の取得

```bash
gh issue view $ARGUMENTS --repo inoue2302/ai-pr-split-demo --json subIssues
```

タイトルに含まれる `[X/N]` の `X` を正規表現 `/\[(\d+)\//` で抽出し、数値昇順でソートする。
パースできない場合は Issue 番号順にフォールバックする。
sub-issues が 0 件の場合は「親Issue に sub-issues が存在しません」と通知して処理を終了する。

### 3. 実装計画をユーザーに提示

以下の形式で実装計画を表示し、**ユーザーの承認を得る**:

```
## 実装計画

親Issue: #{番号} {タイトル}

| 順序 | sub-issue | ブランチ | PR base |
|------|----------|---------|---------|
| 1 | #{番号} {タイトル} | feature/{番号}-{slug} | main |
| 2 | #{番号} {タイトル} | feature/{番号}-{slug} | feature/{前の番号}-{slug} |
| ... | ... | ... | ... |

この順序で実装を開始してよろしいですか？
```

**ユーザーの承認を得てから実装に進むこと。**

### 4. sub-issue の順次実装

各 sub-issue を順番に処理する。以下を sub-issue ごとに繰り返す:

#### 4a. ブランチ作成

```bash
# 1番目の sub-issue
git checkout -b feature/{sub-issue番号}-{slug} main

# 2番目以降の sub-issue
git checkout -b feature/{sub-issue番号}-{slug} feature/{前のsub-issue番号}-{slug}
```

`{slug}` は sub-issue タイトルから短い英語のスラッグを生成する（例: `endpoint-dto`, `repository`, `usecase`）。
slug は英小文字・数字・ハイフンのみ許可し、その他の文字はハイフンに置換する。連続するハイフンは1つにまとめる。

#### 4b. 実装

- sub-issue の本文から実装スコープ・受け入れ基準を読み込む
- 親Issue の全体方針を参照しつつ実装
- CLAUDE.md のコンベンションに従う
- 変更は sub-issue のスコープ内に留める

#### 4c. 動作確認

```bash
npx tsc --noEmit
```

型エラーがある場合は修正する。

#### 4d. コミットと push

```bash
git add <変更ファイル>
git commit -m "{sub-issue の変更内容を端的に表すメッセージ}"
git push -u origin feature/{sub-issue番号}-{slug}
```

#### 4e. PR 作成

```bash
# 1番目の sub-issue
gh pr create \
  --repo inoue2302/ai-pr-split-demo \
  --base main \
  --title "[1/N] {sub-issue タイトル}" \
  --body "{PR本文}"

# 2番目以降の sub-issue
gh pr create \
  --repo inoue2302/ai-pr-split-demo \
  --base feature/{前のsub-issue番号}-{slug} \
  --title "[2/N] {sub-issue タイトル}" \
  --body "{PR本文}"
```

PR 本文には以下を含める:

```markdown
## 概要
{sub-issueの概要}

## 親Issue
#{親Issue番号} {親Issueタイトル}

## 関連PR
- 前: なし（base: main）← 1番目の場合 / #{前のPR番号}（このPRのbase）← 2番目以降
- 次: 未作成

## 変更内容
- 変更点1
- 変更点2

---
Closes #{sub-issue番号}
```

#### 4f. sub-issue のクローズについて

PR 本文に `Closes #{sub-issue番号}` を含めているため、PR がマージされた時点で GitHub が自動的に sub-issue をクローズする。
手動で `gh issue close` を実行する必要はない。

### 5. 結果サマリーの表示

すべての sub-issue の実装が完了したら、以下を表示する:

```
## 実装完了

親Issue: #{親Issue番号} {親Issueタイトル}

| # | sub-issue | PR | ブランチ | 状態 |
|---|----------|-----|---------|------|
| 1 | #{番号} {タイトル} | PR #{PR番号} | feature/{番号}-{slug} | ✅ |
| 2 | #{番号} {タイトル} | PR #{PR番号} | feature/{番号}-{slug} | ✅ |
| ... | ... | ... | ... | ... |

マージ順序: PR #{1番目} → #{2番目} → ... → #{最後}
各PRは前のPRとの差分のみ含みます。

次のステップ: `/review {PR番号}` で各PRをレビューできます。
```

## ブランチ戦略（数珠繋ぎ）

```
main
 └── feature/{1番目}-{slug}        ← PR (base: main)
      └── feature/{2番目}-{slug}   ← PR (base: feature/{1番目}-{slug})
           └── feature/{3番目}-{slug}  ← PR (base: feature/{2番目}-{slug})
                └── ...
```

マージは上から順に行う。各PRのdiffは前のブランチとの差分のみ = 小さい差分を維持。

## 注意事項

- 実装計画は必ずユーザーの承認を得てから実装を開始する
- 各 sub-issue の実装スコープを超える変更はしない
- 型チェックが通らない場合は修正してから次に進む
- コミットメッセージは変更内容を端的に表す
- PR の数珠繋ぎ構造（base ブランチ）を正しく設定する
- 各ステップでコマンドが失敗した場合は処理を中断し、ユーザーにエラー内容を報告して続行可否を確認する
- 日本語でPR本文を記載する
