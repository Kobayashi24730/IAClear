import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import Home from "../components/Home.jsx";
import ComoUsar from "../components/ComoUsar.jsx";
import AIPage from "../components/AIPage.jsx";

export default function App() {
  const [projectId, setProjectId] = useState(() => {
    const saved = localStorage.getItem("fisiqia_project");
    if (saved) return saved;

    const id = crypto.randomUUID();
    localStorage.setItem("fisiqia_project", id);
    return id;
  });

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  function criarNovoProjeto() {
    const novo = crypto.randomUUID();
    localStorage.setItem("fisiqia_project", novo);
    setProjectId(novo);
  }

  const theme = {
    bg: "#f4f4f4",
    mainBg: "#ffffff",
    text: "#111111",
    header: "#eaeaea",
    btn: "#e0e0e0",
    btnHover: "#d0d0d0",
  };

  return (
    <BrowserRouter>
      <div
        style={{
          fontFamily: "Segoe UI, Arial, sans-serif",
          background: theme.bg,
          color: theme.text,
          minHeight: "100vh",
          width: "100%",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
        }}
      >
        {/* HEADER FIXO */}
        <header
          style={{
            width: "100%",
            height: "64px",
            background: theme.header,
            color: theme.text,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 14px",
            boxSizing: "border-box",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 999,
            borderBottom: "1px solid #ccc",
          }}
        >
          <h1 style={{ margin: 0 }}>FisiQIA</h1>

          <div style={{ display: "flex", alignItems: "center" }}>
            <small style={{ marginRight: 12 }}>
              Projeto: <strong style={{ marginLeft: 6 }}>{projectId}</strong>
            </small>

            <button
              onClick={criarNovoProjeto}
              style={{
                padding: "8px 12px",
                background: theme.btn,
                color: theme.text,
                border: "1px solid #aaa",
                borderRadius: 4,
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = theme.btnHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = theme.btn)
              }
            >
              Novo Projeto
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main
          style={{
            paddingTop: "90px",
            paddingLeft: "0px",
            paddingRight: "0px",
            background: theme.mainBg,
            minHeight: "100vh",
            width: "100%",
            overflowX: "hidden",
            margin: 0,
            boxSizing: "border-box",
            opacity: animate ? 1 : 0,
            transform: animate ? "translateX(0)" : "translateX(-50px)",
            transition: "all 0.6s ease",
          }}
        >
          {/* NAVBAR */}
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              padding: "0",
              margin: 0,
            }}
          >
            <Navbar projectId={projectId} />
          </div>

          {/* CONTEÚDO DAS ROTAS */}
          <div style={{ padding: "0 12px", boxSizing: "border-box" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/como-usar" element={<ComoUsar />} />
              <Route path="/visao" element={<AIPage />} />
              <Route path="/materiais" element={<AIPage />} />
              <Route path="/montagem" element={<AIPage />} />
              <Route path="/procedimento" element={<AIPage />} />
              <Route path="/relatorio" element={<AIPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
              }
