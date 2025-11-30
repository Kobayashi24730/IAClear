import express from "express";
import OpenAI from "openai";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

// ---------- OPENAI CLIENT ----------
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------- PERMITIR SPA (FRONTEND DO VITE) ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// pasta do frontend após build
const distPath = path.join(__dirname, "front-end", "dist");

// serve os arquivos estáticos do Vite
app.use(express.static(distPath));

// ---------- SUA API ----------
app.post("/perguntar", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;

    const resposta = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: pergunta }],
    });

    res.json({ resposta: resposta.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ---------- ROTA PARA SPA ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ---------- PORTA (Render usa variável PORT) ----------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
