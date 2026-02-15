---
name: draft-pr
description: 現在のブランチの差分からドラフトPRを作成する。実行前に必ずユーザーに確認する
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(gh *)
---

# ドラフト PR 作成

## 手順

1. **差分の収集**
   - `git log main..HEAD --oneline` でコミット一覧を取得
   - `git diff main...HEAD` で差分を取得
   - 現在のブランチ名を確認する

2. **PR 内容の作成**
   - 差分とコミット履歴から PR タイトルと本文を作成する
   - ブランチ名に Issue 番号が含まれていれば（`feature/issue-N`）、本文に `Closes #N` を含める
   - 本文は以下のフォーマットに従う:
     ```
     ## Summary
     - 変更内容の箇条書き

     ## Test plan
     - テスト方法のチェックリスト
     ```

3. **ユーザーに確認（必須）**
   実行する `gh pr create` コマンドの全文をユーザーに提示し、承認を得てから実行する。
   コマンドは以下の形式:
   ```
   gh pr create --draft --title "タイトル" --body "本文"
   ```
   **確認なしに PR を作成してはならない。**

4. **PR 作成**
   ユーザーの承認後にコマンドを実行し、PR の URL を表示する。
