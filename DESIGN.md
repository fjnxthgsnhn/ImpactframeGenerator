---
name: Impact Frame Generator
colors:
  background: "#0d0d0d"
  on-background: "#f5f5f5"
  surface: "#1a1a1a"
  surface-bright: "#2a2a2a"
  surface-container: "#1e1e1e"
  surface-container-high: "#262626"
  surface-container-highest: "#303030"
  on-surface: "#f5f5f5"
  on-surface-variant: "#a0a0a0"
  outline: "#404040"
  outline-variant: "#333333"
  primary: "#ff4d4d"
  on-primary: "#0d0d0d"
  primary-container: "#3d0000"
  on-primary-container: "#ff9999"
  secondary: "#4da6ff"
  on-secondary: "#0d0d0d"
  secondary-container: "#001a3d"
  on-secondary-container: "#99ccff"
  tertiary: "#ffcc00"
  on-tertiary: "#0d0d0d"
  tertiary-container: "#3d3000"
  on-tertiary-container: "#ffe680"
  error: "#ff4444"
  on-error: "#0d0d0d"
  error-container: "#3d0000"
  on-error-container: "#ffaaaa"
  success: "#44ff44"
  on-success: "#0d0d0d"
  success-container: "#003d00"
  on-success-container: "#aaffaa"
typography:
  heading-xl:
    fontFamily: "Noto Sans JP"
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 1.3
    letterSpacing: -0.01em
  heading-lg:
    fontFamily: "Noto Sans JP"
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 1.3
    letterSpacing: -0.01em
  heading-md:
    fontFamily: "Noto Sans JP"
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 1.4
  body-lg:
    fontFamily: "Noto Sans JP"
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 1.6
  body-md:
    fontFamily: "Noto Sans JP"
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 1.6
  label-sm:
    fontFamily: "Noto Sans JP"
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 1.4
    letterSpacing: 0.02em
  label-xs:
    fontFamily: "Noto Sans JP"
    fontSize: 10px
    fontWeight: "500"
    lineHeight: 1.4
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 16px
  section-gap: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 20px
  button-primary-hover:
    backgroundColor: "#e64545"
  button-secondary:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 20px
  button-secondary-hover:
    backgroundColor: "{colors.surface-container-highest}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 16px
  button-ghost-hover:
    backgroundColor: "{colors.surface-container}"
  card-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    borderColor: "{colors.outline-variant}"
  card-elevated:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    borderColor: "{colors.outline}"
  input-field:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 12px
    borderColor: "{colors.outline-variant}"
  input-field-focus:
    borderColor: "{colors.primary}"
  preset-card:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
    borderColor: "{colors.outline-variant}"
  preset-card-selected:
    borderColor: "{colors.primary}"
    backgroundColor: "{colors.primary-container}"
  frame-thumbnail:
    rounded: "{rounded.md}"
    borderColor: "{colors.outline-variant}"
  frame-thumbnail-selected:
    borderColor: "{colors.primary}"
  slider-track:
    backgroundColor: "{colors.surface-container-highest}"
    rounded: "{rounded.full}"
    height: 6px
  slider-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
  slider-thumb:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    width: 16px
    height: 16px
  badge:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.full}"
    padding: 2px 8px
---

## Brand & Style

Impact Frame Generator は、クリエイターが画像にインパクトフレーム（戦闘シーンや漫画的なエフェクト）を追加するためのツールである。ブランドパーソナリティは **力強さ**、**エネルギー**、**クリエイティビティ** を核とする。

ダークテーマを基調とし、アクセントカラーとして赤（プライマリ）・青（セカンダリ）・黄（ターシャリ）を使用することで、戦闘シーンのような緊張感とダイナミズムを表現する。UI はユーザーのクリエイティブワークを妨げないよう、控えめかつ直感的であることを重視する。

## Colors

カラーパレットはダークベースに高彩度のアクセントカラーを組み合わせ、視認性とインパクトを両立する。

- **Background (#0d0d0d)**: 深い黒を基調とし、画像プレビューやエフェクトが際立つようにする。
- **Primary (#ff4d4d)**: インパクト・破壊・エネルギーを象徴する赤。主要なアクションボタンや選択状態に使用する。
- **Secondary (#4da6ff)**: 冷静さ・精密さを象徴する青。補助的な操作や情報表示に使用する。
- **Tertiary (#ffcc00)**: 警告・強調を象徴する黄。ハイライトや注意喚起に使用する。
- **Surface**: 背景からわずかに浮き上がったカードやパネルに使用する暗灰色の階層。
- **On-colors**: 各背景色上でのテキスト・アイコンの色。WCAG AA 準拠のコントラスト比を確保する。

## Typography

日本語 UI を前提とし、**Noto Sans JP** を標準フォントとして使用する。見出しは太字で力強く、本文は読みやすさを重視したウェイト設定とする。

- **Hierarchy**: 見出しは `heading-xl` (28px) から `heading-md` (18px) の3段階、本文は `body-lg` (16px) と `body-md` (14px) の2段階。
- **Labels**: ボタンやバッジなどの小さな UI 要素には `label-sm` (12px) と `label-xs` (10px) を使用し、やや広めの字間で視認性を確保する。
- **Weight**: 見出しは 600-700、本文は 400、ラベルは 500 を使用し、情報の階層を明確にする。

## Layout & Spacing

4px ベースグリッドを採用し、コンパクトかつ情報密度の高いレイアウトを実現する。

- **Container Padding**: 画面全体に 16px のパディングを適用し、エッジに余白を確保する。
- **Section Gap**: セクション間は 24px の間隔を空け、情報のグループ化を明確にする。
- **Card Spacing**: カード内部は 16px のパディングでコンテンツを適切に囲む。
- **Compact Mode**: ツールバーやコントロールパネルは最小限の余白で操作効率を優先する。

## Elevation & Depth

ダークテーマにおける奥行きは、輝度の差で表現する。影（box-shadow）ではなく、背景色の明度差でレイヤーを区別する。

- **Level 0 (Background)**: `#0d0d0d` - 最背面
- **Level 1 (Surface)**: `#1a1a1a` - ベースカード
- **Level 2 (Container)**: `#1e1e1e` - 一段浮いたコンテナ
- **Level 3 (Container High)**: `#262626` - さらに強調された領域
- **Level 4 (Container Highest)**: `#303030` - 最前面（モーダルなど）
- **Border**: 各レベル間に 1px の `outline-variant` (#333333) ボーダーを適用し、レイヤーの境界を明確にする。

## Shapes

角丸は全体的に控えめな設定とし、直線的で力強い印象を与える。

- **Cards & Containers**: `rounded-lg` (0.75rem / 12px) を標準とする。
- **Buttons & Inputs**: `rounded-md` (0.5rem / 8px) を使用し、操作要素であることを示す。
- **Badges & Chips**: `rounded-full` でピル型にし、タグやステータス表示に適した形状とする。
- **Thumbnails**: フレームサムネイルは `rounded-md` でわずかに角を落とし、画像コンテンツを引き立てる。

## Components

### Buttons

3種類のボタンバリアントを定義する。Primary は主要アクション（生成・エクスポート）、Secondary は補助アクション、Ghost は最小限の強調で配置する。

### Cards

Surface カードと Elevated カードの2種類。Surface は標準的なコンテンツ領域、Elevated はドラッグ&ドロップ領域やモーダルなど、より強調が必要な場合に使用する。

### Input Fields

テキスト入力・数値入力に使用する。フォーカス時には Primary カラーのボーダーでアクティブ状態を明示する。

### Preset Cards

プリセット選択用のカード。選択状態では Primary カラーのボーダーとコンテナ背景でアクティブを表現する。

### Frame Thumbnails

生成されたフレームのサムネイル表示。選択状態では Primary カラーのボーダーでアクティブを表現する。

### Sliders

Intensity や Randomness の調整に使用するスライダー。トラック・フィル・サムの3要素で構成し、Primary カラーで現在値を示す。

### Badges

カテゴリ表示やステータス表示に使用する小型のラベル。Primary コンテナ背景に Primary コンテナテキストで視認性を確保する。