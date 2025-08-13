import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 研修では許可を広めに。必要に応じて特定オリジンへ絞ってください
app.use(cors({ origin: true }));
app.use(express.json());

// ヘルスチェック
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "vibe-coding-starter" });
});

app.post("/generate-bio", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY が未設定です" });
    }
    const { displayName = "", title = "", skills = [] } = req.body || {};
    const name = displayName || "参加者";

    const prompt = `
あなたは短く魅力的な自己紹介文を作るプロ編集者です。
条件:
- 日本語、120〜180文字程度
- 過度な誇張なし、親しみやすく信頼感のある文体
- 箇条書きは使わず1段落
- 最後に「よろしくお願いします。」で締める

入力:
- 氏名(または表示名): ${name}
- 肩書/役割: ${title || "（未入力）"}
- スキル: ${Array.isArray(skills) ? skills.join(", ") : ""}

出力: 自己紹介文のみ。`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return res.json({ bio: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "生成に失敗しました" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
