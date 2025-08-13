# バイブコーディング研修スターター

Googleログイン → Firestoreプロフィール → Geminiで自己紹介生成 の最小構成。

## 構成
- Frontend: `index.html`, `app.js`（Firebase Auth/Firestore）
- Backend: `server.js`（Express, /generate-bio）
- Hosting: Render（Node）
- Repo: GitHub

## 事前準備
1. GitHubで新規リポジトリを作成し、この一式をコミット
2. Renderで「New Web Service」→ このリポジトリを選択  
   - Environment: Node  
   - Start Command: `node server.js`  
   - Environment Variables: `GEMINI_API_KEY` を追加
3. Firebase コンソールでプロジェクト作成
   - Authentication → Sign-in method → Google を **有効化**
   - Firestore を **有効化**
   - Project settings → `firebaseConfig` を `app.js` に貼り付け
   - Authentication → Settings → Authorized domains に
     - `localhost`
     - Renderのドメイン（例：`your-service.onrender.com`）
     を追加
4. `app.js` の `API_BASE` を Render の URL に置換

## 使い方
- ローカルで `index.html` をブラウザで開く（推奨：VS Code拡張の Live Server）
- 「Googleでログイン」→ プロフィールを入力し「保存」
- 「AIで自己紹介生成」で `server.js` の `/generate-bio` を呼ぶ

## トラブルシュート
- ログイン後に画面が戻る  
  → Authorized domains に Render ドメインを入れたか確認
- CORSエラー  
  → `server.js` の `cors({ origin: true })` をオリジン固定に変更  
  例：`cors({ origin: ["http://127.0.0.1:5500", "https://your-service.onrender.com"] })`
- 生成失敗  
  → `GEMINI_API_KEY` 設定と Render のログを確認

## 次の段階
- Firestore セキュリティルール強化（自分の uid のみ読書可）
- /generate-bio を **IDトークン検証付き**に
- Cursor / Claude Code でリファクタ → PRで差分レビュー
