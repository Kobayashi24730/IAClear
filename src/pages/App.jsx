import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import Home from "../components/Home.jsx";
import ComoUsar from "../components/ComoUsar.jsx";

export default function App() {
  const [projectId, setProjectId] = useState(() => {
    const saved = localStorage.getItem("fisiqia_project");
    if (saved) return saved;

    const id = crypto.randomUUID();
    localStorage.setItem("fisiqia_project", id);
    return id;
  });

  function criarNovoProjeto() {
    const novo = crypto.randomUUID();
    localStorage.setItem("fisiqia_project", novo);
    setProjectId(novo);
  }

  return (
    <BrowserRouter>
      <div style={{ fontFamily: "Inter, Arial, sans-serif" }}>
        {/* HEADER FIXO */}
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
              }}
            >
              Novo Projeto
            </button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main
          style={{
            paddingTop: "80px", // para não ficar atrás do header
            paddingLeft: "20px", // espaçamento lateral consistente
            paddingRight: "20px",
            boxSizing: "border-box",
          }}
        >
          {/* NAVBAR abaixo do header */}
          <div style={{ marginBottom: "20px" }}>
            <Navbar projectId={projectId} />
          </div>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/como-usar" element={<ComoUsar />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
