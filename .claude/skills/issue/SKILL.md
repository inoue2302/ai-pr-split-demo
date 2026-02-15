---
name: issue
description: GitHub Issueを読み込み、内容に従って実装・コミット・PR作成まで行う
argument-hint: [issue-number]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(gh *), Bash(git *), Bash(npm *), Bash(npx *)
---

# GitHub Issue #$ARGUMENTS の対応

## 手順

1. **Issue の読み込み**
   以下のコマンドで Issue の内容を取得する:
   ```
   gh issue view $ARGUMENTS --repo inoue2302/ai-pr-split-demo
   ```

2. **作業ブランチの作成**
   - Issue の内容に基づいて適切なブランチ名を決める（例: `feat/issue-$ARGUMENTS-short-description`）
   - `main` から新しいブランチを作成してチェックアウトする

3. **実装**
   - Issue の「やること」に従って実装する
   - CLAUDE.md のコンベンションに従う
   - 変更は最小限に、Issue の要求のみ対応する

4. **動作確認**
   - 型チェック: `npx tsc --noEmit`
   - 必要に応じてビルド: `npm run build`

5. **コミット**
   - 変更内容に応じて適切な粒度でコミットする
   - コミットメッセージは変更内容を端的に表す

6. **PR 作成**
   - `gh pr create` で PR を作成する
   - PR の description に Issue 番号を含める（`Closes #$ARGUMENTS`）
   - PR の URL を表示する
