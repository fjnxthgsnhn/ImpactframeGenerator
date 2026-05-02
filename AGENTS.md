# AGENTS.md — Impact Frame Generator エージェントコーディング指示書

> 本ドキュメントは、コーディングエージェントが `docs/backlog_v1.md` に基づき自律的に実装を進めるためのルールとフローを定義する。

---

## 1. 基本ルール

- すべての実装は `docs/ImpactframeGenerator_specification_v1.md` の仕様に従う。
- デザインは `DESIGN.md` に定義されたデザイントークンに従う。
- 画像処理は 100% ブラウザ内で完結させ、外部サーバーへ画像を送信しない。
- 重い処理は必ず Web Worker 内で実行し、UI スレッドをブロックしない。

---

## 2. タスク実行フロー

エージェントは以下のフローに従い、バックログのタスクを順次実行する。

### Step 1: タスク選択

`docs/backlog_v1.md` から **未着手の最優先タスク** を選択する。優先度順: **P0 → P1 → P2 → P3**。同一優先度内ではエピック順・ID 順に従う。

### Step 2: 実装プラン立案

タスクの実装に着手する前に、必ず **実装プランを立案** する。プランには以下を含める:

- **タスクの理解**: 仕様書の該当セクションを読み込み、実装すべき要件を明確化する
- **影響範囲の調査**: 既存コードベースを探索し、新規作成/修正が必要なファイルを特定する
- **設計方針**: コンポーネント構成、データフロー、Worker との通信方式を決定する
- **サブエージェント割り当て計画**: タスクを最大 5 つのサブタスクに分割し、各サブエージェントの担当範囲を定義する
- **受け入れ基準**: 実装完了とみなすための具体的な条件をリストアップする

プランはユーザーに提示する必要は無く、自動的に Step 3 へ進む。

### Step 3: サブエージェント展開

Step 2 で立案したプランに基づき、**最大 5 つのサブエージェントを並列展開**してコーディングを行う。

各サブエージェントには以下の情報を与える:
- 担当する具体的な実装範囲（ファイル名、関数名、コンポーネント名）
- 参照すべき仕様書のセクション番号
- 参照すべき既存コードのファイルパス
- 期待する出力（作成/修正されるファイルとその内容の概要）

サブエージェントの役割分担例:
```
サブエージェント 1: 型定義・インターフェースの作成
サブエージェント 2: コアロジックの実装
サブエージェント 3: UI コンポーネントの実装
サブエージェント 4: Web Worker の実装
サブエージェント 5: 単体テストの作成
```

### Step 4: コードレビュー

全サブエージェントの完了後、生成されたコードをレビューする。以下の観点で検証する:

| 観点 | チェック内容 |
|------|-------------|
| 仕様準拠 | 仕様書の要件を満たしているか |
| 型安全性 | TypeScript の型が正しく定義されているか |
| デザイン準拠 | DESIGN.md のトークンを使用しているか |
| パフォーマンス | Web Worker 化されているか、メモリリークがないか |
| コード品質 | 命名規則・ディレクトリ構成・責務分離が適切か |
| テスト | テストが記述され、パスするか |
| ブラウザ動作 | Playwright による実ブラウザでの E2E 動作確認がパスするか |

### Step 4.5: Playwright によるブラウザ動作チェック

Web UI の実装後、Playwright を使用して実際のブラウザ（Chromium）上で動作確認を行う。

#### テストシナリオ

以下の E2E テストを Playwright で実装・実行する:

1. **画像読み込みテスト**
   - `sample/sample.png` をドラッグ&ドロップで読み込む
   - 画像が正常にプレビュー表示されることを確認
2. **中心点自動検出テスト**
   - 顔検出モードで中心点が自動設定されることを確認
   - 検出候補が UI に表示されることを確認
3. **手動補正テスト**
   - プレビュー画像上をクリックして中心点を手動指定できることを確認
   - ドラッグで中心点が移動することを確認
4. **フレーム生成テスト**
   - プリセットを選択し [Generate] ボタンで 2〜5 枚のフレームが生成されることを確認
   - 生成されたフレームがサムネイル表示されることを確認
5. **エクスポートテスト**
   - PNG 単体ダウンロードが正常に動作することを確認
   - ZIP 一括ダウンロードが正常に動作することを確認
6. **クロスブラウザテスト**
   - Chromium, Firefox, WebKit の 3 ブラウザで基本シナリオを実行

#### Playwright 設定

```bash
# Playwright のインストール
npm install -D @playwright/test playwright
npx playwright install chromium firefox webkit
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
```

#### サンプル画像

E2E テストでは `sample/sample.png` をテスト用入力画像として使用する。

### Step 5: 問題判定と修正

レビューで問題が検出された場合:

1. 問題点を具体的に特定し、修正指示を文書化する
2. **最大 5 つのサブエージェントを再展開**し、修正を並列実行する
3. 修正後、再度レビューを実施する
4. 問題が解消されるまで Step 4〜5 を繰り返す（最大 3 回まで）

### Step 6: タスク完了

問題がなければ:
1. 完了したタスクを `docs/backlog_v1.md` 上でチェック済みとしてマークする
2. 次のタスクを選択し Step 1 に戻る

---

## 3. サブエージェント展開ポリシー

### 展開条件

- 1 タスクにつき最大 5 サブエージェントを展開する
- タスクが小規模（1 ファイルの単純な修正など）の場合は 1〜2 サブエージェントでも可
- タスク間に依存関係がある場合は、依存先タスクの完了を待ってから展開する

### サブエージェント指示テンプレート

```
## タスク
[タスク ID] [タスクタイトル]

## 仕様参照
- 仕様書: docs/ImpactframeGenerator_specification_v1.md セクション [X]
- バックログ: docs/backlog_v1.md エピック [Y]

## 実装範囲
[具体的なファイルパスと実装内容]

## 既存コード参照
[依存する既存ファイルのパス]

## 出力
[作成/修正するファイル一覧]

## 制約
- TypeScript の strict モードに準拠すること
- Tailwind CSS + DESIGN.md トークンを使用すること
- Web Worker 化が必要な処理は必ず Worker 内で実装すること
```

---

## 4. コード規約

### ディレクトリ構成

```
src/
├─ app/              # アプリ全体のレイアウト・ルーティング
├─ components/       # React コンポーネント
├─ workers/          # Web Worker スクリプト
├─ lib/
│  ├─ canvas/        # Canvas 操作ユーティリティ
│  ├─ effects/       # エフェクト処理
│  ├─ detectors/     # MediaPipe 検出モジュール
│  ├─ svg/           # SVG 生成・操作
│  ├─ export/        # PNG/WebP/ZIP エクスポート
│  └─ presets/       # プリセット定義
├─ stores/           # Zustand ストア
└─ types/            # 共有型定義
```

### 命名規則

- ファイル名: `kebab-case.ts` / `kebab-case.tsx`
- コンポーネント: `PascalCase`
- 関数・変数: `camelCase`
- 型・インターフェース: `PascalCase`
- 定数: `UPPER_SNAKE_CASE`

### 型定義

- すべての関数に明示的な戻り値の型を付与する
- `any` の使用を禁止する
- 仕様書で定義された型（`EffectAnchor`, `ImpactPreset`, `EffectStep` など）を厳密に使用する

---

## 5. 品質ゲート

各タスク完了時に以下のチェックをパスすること:

```bash
# TypeScript の型チェック
npx tsc --noEmit

# リント
npm run lint

# 単体テスト
npm run test

# DESIGN.md の lint
npx @google/design.md lint DESIGN.md

# Playwright E2E テスト
npx playwright test
```

---

## 6. 環境情報

| 項目 | 値 |
|------|-----|
| ランタイム | Node.js |
| パッケージマネージャー | npm |
| フレームワーク | React + Vite + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| デザインシステム | DESIGN.md (`@google/design.md`) |
| 状態管理 | Zustand |
| テスト | Vitest + Playwright |
| E2E テスト | Playwright (Chromium, Firefox, WebKit) |
| ホスティング | Cloudflare Pages |

---

## 7. 参照ドキュメント

| ドキュメント | パス | 用途 |
|-------------|------|------|
| 仕様書 | `docs/ImpactframeGenerator_specification_v1.md` | 全機能の仕様定義 |
| バックログ | `docs/backlog_v1.md` | タスク一覧と優先度 |
| デザインシステム | `DESIGN.md` | デザイントークン定義（要作成） |
| DESIGN.md 仕様 | `design.md/docs/spec.md` | DESIGN.md フォーマット仕様 |
| プラン | `docs/plan_v1.md` | 初期計画ドラフト（参考） |
| サンプル画像 | `sample/sample.png` | Playwright E2E テスト用入力画像 |
