import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { perguntarIA } from "../assets/api.js";
import ReactMarkdown from "react-markdown";
import "../assets/CSS/markdown.css";

export default function AIPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rota = location.pathname;

  const [projeto, setProjeto] = useState(localStorage.getItem("projeto") || "");
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    function atualizar() {
      setProjeto(localStorage.getItem("projeto") || "");
    }

    window.addEventListener("projetoAtualizado", atualizar);

    return () => window.removeEventListener("projetoAtualizado", atualizar);
  }, []);

  if (!projeto.trim()) {
    return (
      <div style={styles.page}>
        <h2>Projeto não definido</h2>
        <button style={styles.home} onClick={() => navigate("/")}>
          🏠 Voltar
        </button>
      </div>
    );
  }

  const session_id =
    localStorage.getItem("session_id") || crypto.randomUUID();
  localStorage.setItem("session_id", session_id);

  async function carregarResposta() {
    setCarregando(true);

    
    const nomeAtual = localStorage.getItem("projeto") || "";
    setProjeto(nomeAtual);

    const resposta = await perguntarIA(rota, nomeAtual, session_id);

    if (resposta?.resposta) setResultado(resposta.resposta);

    setCarregando(false);
  }

  useEffect(() => {
    if (rota !== "/relatorio") {
      carregarResposta();
    }
  }, [rota, projeto]);

  async function baixarPDF() {
    const req = await fetch(
      "https://iaclear-1-backend.onrender.com/relatorio",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projeto, session_id }),
      }
    );

    const blob = await req.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio.pdf";
    a.click();
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.leftButtons}>
          <button style={styles.home} onClick={() => navigate("/")}>
            🏠 Home
          </button>
          <button style={styles.comousar} onClick={() => navigate("/ComoUsar")}>
            ❓ Tirar dúvidas
          </button>
        </div>

        <button style={styles.gerar} onClick={carregarResposta}>
          🔍 Pesquisar
        </button>
      </div>

      <h1>{rota.replace("/", "").toUpperCase()}</h1>
      <h3>Projeto: {projeto}</h3>

      {rota === "/relatorio" ? (
        <button style={styles.btn} onClick={baixarPDF}>
          📄 Gerar PDF
        </button>
      ) : carregando ? (
        <p>Carregando...</p>
      ) : (
        <div style={styles.resultado}>
          <ReactMarkdown className="markdown-body">{resultado}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', sans-serif",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  leftButtons: {
    display: "flex",
    gap: "10px",
  },
  home: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#2d2d2d",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  comousar: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#444",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  gerar: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "#0078d4",
    color: "#fff",
    cursor: "pointer",
    fontSize: "17px",
  },
  btn: {
    width: "100%",
    padding: "14px",
    background: "#0078d4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    marginTop: "16px",
    cursor: "pointer",
    fontSize: "17px",
  },
  resultado: {
    marginTop: "25px",
    padding: "20px",
    borderRadius: "14px",
    background: "rgba(255, 255, 255, 0.7)",
    border: "1px solid rgba(0,0,0,0.1)",
    maxHeight: "65vh",
    overflowY: "auto",
  },
};
