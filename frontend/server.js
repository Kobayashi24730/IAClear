import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

app.listen(8000, () => console.log("Servidor rodando na porta 8000"));
