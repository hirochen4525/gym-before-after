# Gym Before/After シミュレーションアプリ

パーソナルジムのBefore/After画像をAIで生成するWebアプリ

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Google Gemini API (gemini-2.0-flash-exp-image-generation)
- **ホスティング**: Vercel
- **コード管理**: GitHub

## プロジェクト構成

```
src/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts    # 画像生成API
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # レイアウト
│   └── page.tsx            # メインページ
```

## 主な機能

1. 写真アップロード（ドラッグ&ドロップ対応）
2. シミュレーション期間選択（3ヶ月/4ヶ月/6ヶ月）
3. Gemini AIによるAfter画像生成
4. Before/After比較表示

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `GEMINI_API_KEY` | Google Gemini APIキー |

## デプロイ

- **本番URL**: https://gymbeforeafter.vercel.app
- **GitHub**: https://github.com/hirochen4525/gym-before-after

GitHubにpushすると自動でVercelにデプロイされる。

## 開発コマンド

```bash
npm run dev    # 開発サーバー起動
npm run build  # ビルド
npm run start  # 本番サーバー起動
```
