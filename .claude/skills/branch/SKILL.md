---
name: branch
description: Issue番号からfeatureブランチを作成してチェックアウトする。番号未指定の場合は現在の差分から推測する
argument-hint: [issue-number]
allowed-tools: Bash(git *), Bash(gh *)
---

# ブランチ作成

## Issue番号が指定された場合

`main` から `feature/issue-$ARGUMENTS` ブランチを作成してチェックアウトする。

```
git checkout main
git pull origin main
git checkout -b feature/issue-$ARGUMENTS
```

## Issue番号が指定されなかった場合

1. `git status`、`git diff`、`git diff --cached` で現在の差分を確認する。未追跡ファイルが存在する場合はその内容も確認する
2. `gh issue list --repo inoue2302/ai-pr-split-demo --state open` で open な Issue 一覧を取得する
3. 差分の内容と Issue 一覧を照合し、最も関連性の高い Issue 番号を特定する
4. 該当する Issue があれば `feature/issue-{N}` ブランチを作成する
5. 該当する Issue がない場合は、差分の内容から適切なブランチ名を `feature/{変更内容の要約}` 形式で決定し、ブランチを作成する
6. 差分もない場合はユーザーに確認する
