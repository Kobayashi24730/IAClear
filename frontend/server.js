import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve arquivos da pasta dist
app.use(express.static(path.join(__dirname, "dist")));

// Rota padrão para SPA (React)
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on ${port}`));
