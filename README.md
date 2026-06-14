# 🍌 Banana Gorilla Skull Game 🦍

7×7グリッドのターン制カードゲームです。チームに分かれてバナナ（得点）を集め、スカルやゴリラを避けながら一番得点の高いチームを目指します。

## 遊び方

1. `index.html` をブラウザで開きます。
2. チーム数（2〜4）とチーム名を設定して「ゲーム開始」。
3. 各チームは2人組:
   - **Player A** が「行（数字 1〜7）」を選びます。
   - **Player B** が「列（色）」を選びます。
   - 交差したカードがめくられます。
4. カード効果:
   - 🍌 **バナナ** … 1〜3 点を獲得。
   - 💀 **スカル** … 自チームの得点が 0 にリセット。
   - 🦍 **ゴリラ** … 相手チームの得点を全て奪う（3チーム以上なら奪う相手を選択）。
5. 全カードをめくったら、得点が一番高いチームの勝ち！

## 特徴

- **カードの配置は毎回ランダム**（盤面 49 マス: ゴリラ6・スカル3・バナナ40 をシャッフル）。
- 2〜4 チーム対応。
- インストール不要。HTML / CSS / JavaScript のみで動作します。

## ファイル構成

| ファイル | 内容 |
| --- | --- |
| `index.html` | 画面構成 |
| `style.css` | スタイル |
| `script.js` | ゲームロジック |

## カード画像

カードのイラストは `assets/` フォルダの画像を使っています（`script.js` の `faceFor()` / `IMAGES` で指定）。

| 画像 | 用途 |
| --- | --- |
| `assets/banana1.png` | 1点 |
| `assets/banana2.png` | 2点 |
| `assets/banana3.png` | 3点 |
| `assets/gorilla.png` | ゴリラ |
| `assets/skull.png` | スカル |

差し替えたい場合は、同じ名前の画像を置き換えるだけでOKです。

## オンラインでプレイ

GitHub Pages で公開できます。公開URL: **https://bubblegumgameboy.github.io/SchoolCardGame/**

> 初回のみ、リポジトリ設定での有効化が必要です（自動トークンでは有効化できないため）。

**かんたんな方法（ブランチ配信）**
1. リポジトリの **Settings → Pages** を開く
2. **Build and deployment → Source** を **「Deploy from a branch」** に
3. Branch でこのブランチ（`claude/beautiful-cannon-sj63b1`、または merge 後の `main`）と `/(root)` を選び **Save**
4. 1〜2分で上記URLが有効になります

**GitHub Actions で自動デプロイしたい場合**
- **Settings → Pages → Source** を **「GitHub Actions」** にすると、`.github/workflows/deploy.yml` が
  push のたびに自動デプロイします。
