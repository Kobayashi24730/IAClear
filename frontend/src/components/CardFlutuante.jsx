import { useState } from "react";
import { perguntarIA } from "../assets/api.js";

export default function CardFlutuante({ rota, projeto, fechar, historico, adicionarPesquisa }) {
  const [pergunta, setPergunta] = useState("");
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviarPergunta() {
    if (!pergunta.trim()) return;

    setCarregando(true);
    const resposta = await perguntarIA(rota, pergunta, projeto);
    if (resposta?.resposta) {
      setResultado(resposta.resposta);
      adicionarPesquisa(pergunta);
    }
    setCarregando(false);
  }

  async function baixarPDF() {
    if (!pergunta.trim()) return;

    setCarregando(true);
    try {
      const req = await fetch("http://localhost:8000/relatorio", { // troque pela URL do Render se necessário
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta, projeto })
      });

      if (!req.ok) throw new Error("Erro ao gerar PDF");

      const blob = await req.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (err) {
      console.error(err);
      setResultado("Erro ao gerar PDF");
    } finally {
      setCarregando(false);
    }
  }

  function renderConteudo() {
    switch (rota) {
      case "/visao":
        return (
          <>
            <h2>Visão Geral</h2>
            <small>Projeto: {projeto}</small>
            <textarea
              placeholder="Pergunte algo sobre seu projeto..."
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              style={style.textarea}
            />
            <button style={style.btn} onClick={enviarPergunta}>Perguntar</button>
          </>
        );

      case "/materiais":
        return (
          <>
            <h2>Materiais de Baixo Custo</h2>
            <textarea
              placeholder="Pergunte sobre materiais..."
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              style={style.textarea}
            />
            <button style={style.btn} onClick={enviarPergunta}>Buscar</button>
          </>
        );

      case "/montagem":
        return (
          <>
            <h2>Montagem e Esquema</h2>
            <textarea
              placeholder="Pergunte sobre a montagem..."
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              style={style.textarea}
            />
            <button style={style.btn} onClick={enviarPergunta}>Gerar</button>
          </>
        );

      case "/procedimento":
        return (
          <>
            <h2>Procedimento</h2>
            <textarea
              placeholder="Pergunte sobre o procedimento..."
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              style={style.textarea}
            />
            <button style={style.btn} onClick={enviarPergunta}>Gerar</button>
          </>
        );

      case "/relatorio":
        return (
          <>
            <h2>Gerar Relatório</h2>
            <small>Gerar arquivo PDF automático</small>
            <textarea
              placeholder="Texto do relatório..."
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              style={style.textarea}
            />
            <button style={style.btn} onClick={baixarPDF}>Baixar PDF</button>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <div style={style.overlay}>
      <div style={style.card}>
        <button style={style.btnClose} onClick={fechar}>✕</button>

        {renderConteudo()}

        {carregando && <p>Carregando...</p>}

        {resultado && (
          <div style={style.resultado}>
            <pre>{resultado}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

const style = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px",       // evita o card colar nas bordas no celular
    zIndex: 9999
  },

  card: {
    width: "100%",
    maxWidth: "650px",
    background: "rgba(250,250,250,0.88)",
    backdropFilter: "blur(14px)",
    borderRadius: "18px",
    padding: "22px",
    boxSizing: "border-box",   // evita estourar tela
    color: "#000",
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    position: "relative",

    maxHeight: "85vh",     // garante que NUNCA sai da tela
    overflowY: "auto"      // scroll interno quando passar do limite
  },

  btnClose: {
    position: "absolute",
    top: "12px",
    right: "12px",
    border: "none",
    background: "transparent",
    fontSize: "22px",
    cursor: "pointer",
    color: "#000"
  },

  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    marginTop: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    resize: "vertical",
    background: "rgba(255,255,255,0.95)",
    boxSizing: "border-box"
  },

  btn: {
    marginTop: "12px",
    padding: "12px 18px",
    background: "#0078d4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%"
  },

  btnSec: {
    marginTop: "12px",
    padding: "12px",
    width: "100%",
    background: "#444",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },

  resultado: {
    background: "#fff",
    padding: "15px",
    marginTop: "18px",
    borderRadius: "12px",
    color: "#333",
    maxHeight: "300px",
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    boxSizing: "border-box"
  }
};
