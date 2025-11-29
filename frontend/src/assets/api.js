// src/assets/api.js

const BASE_URL = "http://10.0.0.113:8000"; // <<< COLOQUE SEU IP LOCAL AQUI

export async function perguntarIA(rota, pergunta, projeto) {
  const req = await fetch(`${BASE_URL}${rota}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pergunta, projeto })
  });

  return await req.json();
}
