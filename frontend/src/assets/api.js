export async function perguntarIA(rota, projeto, session_id) {
  const req = await fetch("https://iaclear-1-backend.onrender.com" + rota, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projeto, session_id })
  });

  if (!req.ok) return null;
  return req.json();
}
