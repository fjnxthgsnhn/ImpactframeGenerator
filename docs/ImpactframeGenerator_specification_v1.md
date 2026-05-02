# Impact Frame Generator 仕様書 v1

## 1. 概要

Impact Frame Generator は、入力画像から 2〜5 枚のインパクトフレーム画像を生成する Web アプリである。

本アプリはサーバー側で画像処理を行わず、すべての画像処理、対象検出、エフェクト合成、書き出しをユーザーのブラウザ内で完結させる。

## 2. 基本方針

- Cloudflare Pages で静的ホスティングする。
- バックエンド、Python、ComfyUI、サーバー側画像処理は使用しない。
- AI 画像生成および動画生成は行わない。
- 入力画像はサーバーへアップロードしない。
- Canvas / SVG / WebAssembly を用いてブラウザ内で画像処理する。
- 人物、顔、物体、前景などを検出し、エフェクト中心点を自動決定できるようにする。
- 自動検出が外れた場合に備え、手動で中心点を補正できるようにする。

## 3. 出力仕様

### 3.1 出力サイズ

生成されるすべてのフレーム画像は、以下の固定サイズとする。

```text
width: 1920px
height: 1080px
aspect ratio: 16:9
```

出力対象は PNG または WebP とし、複数フレームを書き出す場合は ZIP 形式でも保存できる。

### 3.2 出力座標系

アプリ内部の最終合成キャンバスは常に `1920x1080` とする。

エフェクト配置、対象検出結果、手動アンカー、SVG生成、Canvas合成、書き出し処理は、最終的に `1920x1080` の座標系に揃える。

```ts
type OutputSize = {
  width: 1920;
  height: 1080;
};
```

## 4. 入力画像の正規化仕様

### 4.1 正規化ルール

入力画像は、画像処理前に必ず `1920x1080` の作業キャンバスへ正規化する。

正規化方法は CSS の `object-fit: cover` と同等とする。

- 入力画像のアスペクト比を維持して拡大または縮小する。
- `1920x1080` のキャンバス全体を必ず埋める。
- キャンバスからはみ出した領域はクロップする。
- 余白、レターボックス、ピラーボックスは作らない。
- クロップ位置はデフォルトで中央基準とする。

### 4.2 リサイズ・クロップ計算

入力画像サイズを `sourceWidth`, `sourceHeight` とする。

```ts
const outputWidth = 1920;
const outputHeight = 1080;

const scale = Math.max(
  outputWidth / sourceWidth,
  outputHeight / sourceHeight
);

const resizedWidth = sourceWidth * scale;
const resizedHeight = sourceHeight * scale;

const offsetX = (outputWidth - resizedWidth) / 2;
const offsetY = (outputHeight - resizedHeight) / 2;
```

Canvas へ描画する際は以下の形とする。

```ts
ctx.drawImage(
  sourceImage,
  offsetX,
  offsetY,
  resizedWidth,
  resizedHeight
);
```

`offsetX` または `offsetY` は負の値になりうる。負の領域がクロップされる。

### 4.3 入力画像の扱い

- 対応入力形式はブラウザが `ImageBitmap` または `HTMLImageElement` として読み込める画像形式とする。
- 画像読み込み後、最初に `1920x1080` の正規化キャンバスを生成する。
- 以降の検出、加工、エフェクト合成は正規化済み画像を対象に行う。
- 元画像のEXIF向き情報は、ブラウザの画像デコード結果に従う。

## 5. 技術スタック

| 領域 | 採用技術 |
|---|---|
| ホスティング | Cloudflare Pages |
| フロントエンド | React + Vite + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| デザインシステム | DESIGN.md (`@google/design.md`) |
| 画像描画 | HTML Canvas / OffscreenCanvas |
| 画像処理 | OpenCV.js |
| SVG処理 | inline SVG / SVG DOM / Canvg |
| 合成 | Canvas 2D API |
| 高速処理 | Web Worker |
| 検出AI | MediaPipe Tasks Vision |
| 追加推論 | onnxruntime-web |
| 保存 | browser download / JSZip |
| 状態管理 | Zustand |
| PWA | Vite PWA |

## 6. 処理パイプライン

```text
画像読み込み
↓
ImageBitmap化
↓
1920x1080 へ cover resize + center crop
↓
正規化済み Canvas へ描画
↓
対象物検出
↓
中心点・バウンディングボックス算出
↓
画像処理
↓
SVG / Canvas エフェクト生成
↓
対象中心に合わせてエフェクト配置
↓
2〜5フレーム差分生成
↓
PNG / WebP / ZIP として保存
```

## 7. 対象物中心点の自動検出

### 7.1 目的

集中線、衝撃波、斬撃、フラッシュなどの中心を画面中央固定ではなく、人物や主対象物に合わせる。

### 7.2 中心点決定ロジック

優先順位は以下とする。

```text
1. ユーザー手動指定ポイント
2. 顔検出
3. 人物検出
4. 物体検出
5. 前景マスクの重心
6. 画像中央
```

### 7.3 中心点データ構造

`x`, `y`, `width`, `height` は、すべて正規化後の `1920x1080` 座標系のピクセル値とする。

```ts
type EffectAnchor = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  confidence: number;
  source:
    | "manual"
    | "face"
    | "person"
    | "object"
    | "foreground"
    | "center";
};
```

### 7.4 中心点計算

顔検出の場合:

```ts
anchor.x = faceBox.x + faceBox.width / 2;
anchor.y = faceBox.y + faceBox.height * 0.45;
```

人物検出の場合:

```ts
anchor.x = personBox.x + personBox.width / 2;
anchor.y = personBox.y + personBox.height * 0.38;
```

物体検出の場合:

```ts
anchor.x = objectBox.x + objectBox.width / 2;
anchor.y = objectBox.y + objectBox.height / 2;
```

前景マスクの場合:

```ts
anchor.x = weightedCentroid(mask).x;
anchor.y = weightedCentroid(mask).y;
```

## 8. 手動補正

自動検出が外れる場合に備え、手動補正を必ず提供する。

- 画像上をクリックして中心点を指定できる。
- ドラッグで中心点を微調整できる。
- 検出候補を複数表示できる。
- 「顔」「人物」「物体」「前景」「中央」から候補を選択できる。
- 中心点をロックできる。
- 手動操作の座標は表示サイズではなく、内部的に `1920x1080` 座標へ変換して保存する。

## 9. エフェクト仕様

### 9.1 SVGエフェクト配置

集中線:

```text
中心点 = anchor
線の始点 = 画面外周
線の終点 = anchor周辺の円
```

衝撃波:

```text
中心点 = anchor
円形リング = anchorを中心に拡大
```

斬撃:

```text
中心点 = anchor
角度 = プリセット指定または対象物の長辺方向
```

稲妻:

```text
始点 = 画面端またはランダム位置
終点 = anchor
```

### 9.2 SVG生成例

集中線:

```ts
generateRadialLines({
  width: 1920,
  height: 1080,
  centerX: anchor.x,
  centerY: anchor.y,
  count: 180,
  innerRadius: 80,
  outerRadius: 1600,
  jitter: 0.3
});
```

衝撃波:

```ts
generateShockwave({
  centerX: anchor.x,
  centerY: anchor.y,
  radius: 220,
  irregularity: 0.25,
  strokeWidth: 12
});
```

稲妻:

```ts
generateLightning({
  startX,
  startY,
  endX: anchor.x,
  endY: anchor.y,
  segments: 12,
  amplitude: 35
});
```

## 10. フレーム生成仕様

生成フレーム数は 2〜5 枚とする。

各フレームは同一の `1920x1080` 正規化済み入力画像をベースにし、プリセットごとのエフェクト差分を適用する。

3フレーム集中線の例:

```text
frame_001:
- 線数 80
- opacity 0.35
- innerRadius 160

frame_002:
- 線数 180
- opacity 0.95
- innerRadius 70
- white flash 0.25

frame_003:
- 線数 120
- opacity 0.45
- blur 2px
- RGB split 3px
```

5フレーム衝撃波の例:

```text
frame_001: 小さいリング
frame_002: 拡大リング
frame_003: 最大光量
frame_004: リング崩れ
frame_005: 残像ノイズ
```

## 11. プリセット仕様

```ts
type ImpactPreset = {
  id: string;
  name: string;
  category: string;
  anchorMode: "auto" | "face" | "person" | "object" | "foreground" | "manual" | "center";
  effects: EffectStep[];
};
```

プリセット例:

```ts
{
  id: "target_radial_speed_lines",
  name: "Target Radial Speed Lines",
  category: "battle",
  anchorMode: "auto",
  effects: [
    {
      type: "colorAdjust",
      contrast: 1.4,
      saturation: 0.8
    },
    {
      type: "svgRadialLines",
      blend: "multiply",
      lineCount: 180,
      innerRadius: 80,
      outerRadius: 1600,
      opacity: 0.85,
      jitter: 0.25
    },
    {
      type: "whiteFlash",
      amount: 0.18
    }
  ]
}
```

## 12. インパクトフレーム種類

| No | プリセット | 中心点利用 |
| -: |---|---|
| 1 | White Flash | 任意 |
| 2 | Black Flash | 任意 |
| 3 | Negative Invert | 任意 |
| 4 | Target Speed Lines | 必須 |
| 5 | Radial Shockwave | 必須 |
| 6 | Slash Impact | 推奨 |
| 7 | Lightning Strike | 必須 |
| 8 | Manga Shadow | 顔推奨 |
| 9 | Heavy Ink | 顔推奨 |
| 10 | Screentone Burst | 任意 |
| 11 | Halftone Comic | 任意 |
| 12 | Red Black Impact | 顔・人物推奨 |
| 13 | Blue Electric | 必須 |
| 14 | Golden Awakening | 人物推奨 |
| 15 | Glitch Crash | 任意 |
| 16 | RGB Split | 任意 |
| 17 | VHS Noise | 任意 |
| 18 | Horror Red Focus | 顔推奨 |
| 19 | Ghost Afterimage | 人物推奨 |
| 20 | Double Exposure | 人物推奨 |
| 21 | Flame Burst | 人物推奨 |
| 22 | Smoke Impact | 人物・物体推奨 |
| 23 | Frozen Blue | 人物推奨 |
| 24 | Edge Burst | 物体推奨 |
| 25 | Comedy Shock Mark | 顔推奨 |
| 26 | Sweat Panic Mark | 顔推奨 |
| 27 | Eye Focus Lines | 顔必須 |
| 28 | Explosion Debris | 物体推奨 |
| 29 | Paint Smear | 人物推奨 |
| 30 | Final Blow Frame | 必須 |

## 13. UI仕様

```text
┌──────────────────────────────────────┐
│ Impact Frame Generator                │
├───────────────┬──────────────────────┤
│ Input Image   │ Generated Frames      │
│ 1920x1080     │ [1] [2] [3] [4] [5]  │
├───────────────┴──────────────────────┤
│ Crop Preview                          │
│ cover resize / center crop            │
├──────────────────────────────────────┤
│ Anchor Detection                      │
│ Auto / Face / Person / Object         │
│ Foreground / Manual / Center          │
│ [検出候補を表示] [中心点ロック]        │
├──────────────────────────────────────┤
│ Preset Category                       │
│ Flash / Battle / Manga / Horror       │
│ Glitch / Comedy / Cinematic           │
├──────────────────────────────────────┤
│ Frame Count: 2 3 4 5                  │
│ Intensity: 0 ───────── 100            │
│ Randomness: 0 ──────── 100            │
│ [Generate] [Export ZIP]               │
└──────────────────────────────────────┘
```

## 14. Web Worker仕様

重い処理はUIスレッドで実行しない。

Workerで処理する対象:

- 入力画像の `1920x1080` 正規化
- OpenCV.js 処理
- MediaPipe 検出
- SVG ラスタライズ
- フレーム生成
- ZIP 生成

UIスレッドは画像選択、プレビュー表示、ユーザー操作、進捗表示を担当する。

## 15. プライバシー仕様

画像は外部送信しない。

```text
画像読み込み: local browser only
画像処理: browser memory only
保存: user download only
サーバー保存: なし
```

## 16. Cloudflare Pages設定

build command:

```bash
npm run build
```

output directory:

```text
dist
```

deploy:

```bash
npm run build
npx wrangler pages deploy dist
```

## 17. 注意点

### 17.1 モデルファイル容量

MediaPipe や ONNX モデルを使う場合、静的ファイルとして配信する。

初回ロードが重くなるため、以下の方針とする。

- 顔検出モデルのみ初期ロードする。
- 物体検出は必要時にロードする。
- セグメンテーションは任意機能とする。
- モデルは遅延ロードする。

### 17.2 ブラウザ互換性

推奨ブラウザ:

- Chrome
- Edge
- Firefox

Safari は WebAssembly、OffscreenCanvas、Worker 周りで差が出る可能性があるため、v1では後回しとする。

### 17.3 画質とメモリ

`1920x1080` の Canvas を複数枚保持するため、生成済みフレーム、作業用キャンバス、検出用バッファの保持枚数を増やしすぎない。

不要になった `ImageBitmap`、Canvas、OpenCV Mat は明示的に解放する。

## 18. デザインシステム (DESIGN.md)

### 18.1 概要

本プロジェクトの UI デザインは Google の [DESIGN.md](https://github.com/google-labs-code/design.md) フォーマットに従って定義する。

DESIGN.md は YAML フロントマター（デザイントークン）と Markdown（デザインの根拠）を組み合わせたフォーマットであり、コーディングエージェントがデザインシステムを構造的に理解するために設計されている。

### 18.2 リポジトリ構成

プロジェクトルートに `design.md` リポジトリをクローンし、以下の構成とする。

```text
ImpactframeGenerator/
├─ design.md/              # google-labs-code/design.md リポジトリ（クローン）
│  ├─ docs/spec.md         # DESIGN.md フォーマット仕様
│  ├─ packages/            # @google/design.md CLI パッケージ
│  └─ examples/            # DESIGN.md のサンプル
├─ DESIGN.md               # 本プロジェクトのデザインシステム定義ファイル
├─ docs/
│  ├─ ImpactframeGenerator_specification_v1.md
│  ├─ plan_v1.md
│  └─ backlog_v1.md
└─ src/
```

### 18.3 デザイントークン

本プロジェクトの `DESIGN.md` では以下のトークンを定義する。

- **colors**: プライマリ・セカンダリ・アクセント・背景色など
- **typography**: 見出し・本文・ラベルのフォントファミリー・サイズ
- **rounded**: 角丸のスケール（sm, md, lg）
- **spacing**: 余白のスケール（sm, md, lg, xl）
- **components**: ボタン・カード・入力フィールドなどのコンポーネントトークン

### 18.4 Tailwind CSS との統合

`@google/design.md` CLI の `export --format tailwind` コマンドを使用して、DESIGN.md から Tailwind CSS のテーマ設定を生成する。

```bash
npx @google/design.md export --format tailwind DESIGN.md > tailwind.theme.json
```

生成されたテーマ設定は `tailwind.config.ts` の `extend` にマージする。

### 18.5 デザインシステムの lint

```bash
npx @google/design.md lint DESIGN.md
```

CI/CD パイプラインに lint チェックを組み込み、デザイントークンの一貫性を保証する。

## 19. v1の完了条件

- 入力画像を読み込み、`1920x1080` に cover resize + center crop できる。
- 正規化済み画像をベースに 2〜5 枚のフレームを生成できる。
- 生成される全フレームが `1920x1080` で出力される。
- 中心点を自動または手動で指定できる。
- 少なくとも集中線、衝撃波、フラッシュ系のプリセットを生成できる。
- PNG または WebP で保存できる。
- 複数フレームを ZIP で保存できる。
- 画像をサーバーへ送信しない。