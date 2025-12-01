import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { perguntarIA } from "../assets/api.js";

export default function AIPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rota = location.pathname;
  const projeto = location.state?.projeto || "";

  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (!projeto) {
    return (
      <div style={styles.page}>
        <h2>Projeto não definido</h2>
        <button onClick={() => navigate("/")}>Voltar</button>
      </div>
    );
  }

  useEffect(() => {
    async function carregarResposta() {
      if (rota === "/relatorio") return;

      setCarregando(true);

      const session_id =
        localStorage.getItem("session_id") || crypto.randomUUID();
      localStorage.setItem("session_id", session_id);

      const resposta = await perguntarIA(rota, projeto, session_id);

      if (resposta?.resposta) {
        setResultado(resposta.resposta);
      }

      setCarregando(false);
    }

    carregarResposta();
  }, [rota, projeto]);

  async function baixarPDF() {
    const session_id = localStorage.getItem("session_id");

    const req = await fetch("https://iaclear-1-backend.onrender.com/relatorio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projeto, session_id })
    });

    const blob = await req.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio.pdf";
    a.click();
  }

  return (
    <div style={styles.page}>
      <button style={styles.home} onClick={() => navigate("/")}>🏠 Home</button>

      <h1>{rota.replace("/", "").toUpperCase()}</h1>
      <h3>Projeto: {projeto}</h3>

      {rota === "/relatorio" ? (
        <button style={styles.btn} onClick={baixarPDF}>Gerar PDF</button>
      ) : carregando ? (
        <p>Carregando...</p>
      ) : (
        <div style={styles.resultado}>
          <pre>{resultado}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: "20px", maxWidth: "800px", margin: "0 auto" },
  home: {
    marginBottom: "20px",
    padding: "10px 15px",
    borderRadius: "10px",
    border: "none",
    background: "#222",
    color: "#fff",
    cursor: "pointer"
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#0078d4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    marginTop: "12px",
    cursor: "pointer"
  },
  resultado: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    background: "#f0f0f0",
    whiteSpace: "pre-wrap"
  }
};
