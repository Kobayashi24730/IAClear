import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { perguntarIA } from "../assets/api.js";
import ReactMarkdown from "react-markdown";
import "../assets/CSS/markdown.css";

export default function AIPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rota = location.pathname;
  const projeto = location.state?.projeto || "";

  const [pergunta, setPergunta] = useState(""); 
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (!projeto) {
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

  async function carregarResposta(perguntaAtual) {
    if (!perguntaAtual) return; 
    setCarregando(true);
    const resposta = await perguntarIA(rota, projeto, session_id, perguntaAtual);
    if (resposta?.resposta) {
      setResultado(resposta.resposta);
    }
    setCarregando(false);
  }

  useEffect(() => {
    if (rota !== "/relatorio") {
      carregarResposta(pergunta);
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
          <button style={styles.comousar} onClick={() => navigate("/como-usar")}>
            ❓ Tirar dúvidas
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Digite sua pergunta"
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
              width: "300px",
            }}
          />
          <button style={styles.gerar} onClick={() => carregarResposta(pergunta)}>
            🔍 Pesquisar
          </button>
        </div>
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
    alignItems: "center",
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
    transition: "all 0.2s ease",
  },

  comousar: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#444",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s ease",
  },

  gerar: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "#0078d4",
    color: "#fff",
    cursor: "pointer",
    fontSize: "17px",
    transition: "all 0.2s ease",
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
    transition: "all 0.2s ease",
  },

  resultado: {
    marginTop: "25px",
    padding: "20px",
    borderRadius: "14px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.1)",
    maxHeight: "65vh",
    overflowY: "auto",
  },
};
