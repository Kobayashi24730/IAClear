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
    bg: "#121212",
    mainBg: "#1e1e1e",
    text: "#ffffff",
  };

  return (
    <BrowserRouter>
      <div
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          background: theme.bg,
          color: theme.text,
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            width: "100%",
            height: "64px",
            background: "#111",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            boxSizing: "border-box",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 999,
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
                background: "#4e8cff",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              Novo Projeto
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main
          style={{
            paddingTop: "80px",
            paddingLeft: "20px",
            paddingRight: "20px",
            boxSizing: "border-box",
            background: theme.mainBg,
            minHeight: "100vh",
            opacity: animate ? 1 : 0,
            transform: animate ? "translateX(0)" : "translateX(-50px)",
            transition: "all 0.8s ease",
            borderRadius: "8px",
          }}
        >
          {/* NAVBAR */}
          <div style={{ marginBottom: "20px" }}>
            <Navbar projectId={projectId} />
          </div>

          {/* ROTAS */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/como-usar" element={<ComoUsar />} />
            <Route path="/visao" element={<AIPage />} />
            <Route path="/materiais" element={<AIPage />} />
            <Route path="/montagem" element={<AIPage />} />
            <Route path="/procedimento" element={<AIPage />} />
            <Route path="/relatorio" element={<AIPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
            }
