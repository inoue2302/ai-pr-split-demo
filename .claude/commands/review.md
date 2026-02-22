# /review コマンド

指定されたPRに対して、マルチエージェント構成でコードレビューを実施します。

## 入力

- `$ARGUMENTS`: PR番号 または PR URL

## 手順

### 1. PR情報と差分の取得

```bash
gh pr view $ARGUMENTS --json number,title,body,baseRefName,headRefName
gh pr diff $ARGUMENTS
```

上記コマンドでPR情報と差分を取得してください。

### 2. サブエージェントによるレビュー実行

取得した diff を以下の6つのサブエージェントにそれぞれ渡して `claude -p` で並列実行してください。
各サブエージェントのプロンプトは `.claude/commands/review-*.md` ファイルを使用します。

```bash
DIFF=$(gh pr diff $ARGUMENTS)

# 6つのサブエージェントを並列実行
echo "$DIFF" | claude -p "$(cat .claude/commands/review-logic.md | sed 's/\$ARGUMENTS/stdin/')" &
echo "$DIFF" | claude -p "$(cat .claude/commands/review-naming.md | sed 's/\$ARGUMENTS/stdin/')" &
echo "$DIFF" | claude -p "$(cat .claude/commands/review-performance.md | sed 's/\$ARGUMENTS/stdin/')" &
echo "$DIFF" | claude -p "$(cat .claude/commands/review-security.md | sed 's/\$ARGUMENTS/stdin/')" &
echo "$DIFF" | claude -p "$(cat .claude/commands/review-errorhandling.md | sed 's/\$ARGUMENTS/stdin/')" &
echo "$DIFF" | claude -p "$(cat .claude/commands/review-testing.md | sed 's/\$ARGUMENTS/stdin/')" &
wait
```

**重要**: 各サブエージェントには diff の内容を標準入力で渡し、プロンプト内の `$ARGUMENTS` 部分を diff テキストとして解釈するよう指示してください。

### 3. 結果の集約と整形

各サブエージェントから返却されたJSONを以下の手順で処理してください:

1. 各JSONの `findings` 配列を1つに統合
2. **重複排除**: 同一ファイル・同一行（±3行以内）で類似の指摘内容があれば1つにまとめる
3. **severity順に並び替え**: `critical` → `warning` → `nit`
4. 指摘が0件の場合は「指摘事項はありません」と報告して終了

### 4. GitHub PRへのレビューコメント投稿

`gh api` を使ってインラインコメント付きレビューを投稿してください。

#### position の算出方法

diff のハンク内での相対行番号（1始まり）を使用します。
`@@ -a,b +c,d @@` の直後の行が position=1 です。

#### 投稿コマンド例

```bash
gh api repos/{owner}/{repo}/pulls/{number}/reviews \
  -X POST \
  --input - <<EOF
{
  "body": "## コードレビュー結果\n\n| severity | 件数 |\n|----------|------|\n| critical | X件 |\n| warning | Y件 |\n| nit | Z件 |",
  "event": "COMMENT",
  "comments": [
    {
      "path": "src/example.ts",
      "position": 10,
      "body": "**[critical/logic]** 指摘内容\n\n💡 改善提案"
    }
  ]
}
EOF
```

#### コメントのフォーマット

各インラインコメントは以下の形式にしてください:

```
**[{severity}/{category}]** {message}

💡 {suggestion}
```

- suggestion がない場合は💡行を省略
- severity に応じたプレフィックス:
  - critical: `🚨 **[critical/{category}]**`
  - warning: `⚠️ **[warning/{category}]**`
  - nit: `💬 **[nit/{category}]**`

#### event の選択

- critical が1件以上: `REQUEST_CHANGES`
- critical が0件: `COMMENT`

### 5. 結果サマリーの表示

ターミナルに以下のサマリーを表示してください:

```
## レビュー完了

PR: #{number} {title}

| severity | 件数 |
|----------|------|
| critical | X件  |
| warning  | Y件  |
| nit      | Z件  |

{critical がある場合}
⚠️ critical な指摘があるため REQUEST_CHANGES としてレビューしました。

{critical がない場合}
✅ critical な指摘はありません。COMMENT としてレビューしました。
```

## 注意事項

- 既存のレビューコメントと重複しないよう確認してください
- サブエージェントの結果がJSONとしてパースできない場合はスキップしてください
- diff が空の場合は「差分がありません」と報告して終了してください
- 日本語でコメントしてください
- 良い実装には褒めるコメントも残してください（severity は nit として扱う）
