import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [projeto, setProjeto] = useState(localStorage.getItem("projeto") || "");
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("projeto", projeto);
    window.dispatchEvent(new Event("projetoAtualizado"));
  }, [projeto]);

  // 🔥 Agora o padding é calculado exatamente com a altura da navbar
  useEffect(() => {
    function atualizarPadding() {
      if (navRef.current) {
        document.body.style.paddingTop = navRef.current.offsetHeight + "px";
      }
    }
    atualizarPadding();
    window.addEventListener("resize", atualizarPadding);

    return () => {
      document.body.style.paddingTop = "0px";
      window.removeEventListener("resize", atualizarPadding);
    };
  }, []);

  const items = [
    { nome: "Visão Geral", rota: "/visao" },
    { nome: "Materiais", rota: "/materiais" },
    { nome: "Montagem", rota: "/montagem" },
    { nome: "Procedimento", rota: "/procedimento" },
    { nome: "Relatório", rota: "/relatorio" },
  ];

  return (
    <nav
      ref={navRef}
      style={{
        width: "100%",
        background: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "10px 14px",
      }}
    >
      {/* Linha superior */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h2 style={{ margin: 0 }}>FisiQIA</h2>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#555" }}>
            Projeto: <b>{projeto || "nenhum"}</b>
          </span>
          <button
            style={{
              padding: "6px 10px",
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
            onClick={() => setProjeto("")}
          >
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Input */}
      <input
        placeholder="Digite o nome do projeto..."
        value={projeto}
        onChange={(e) => setProjeto(e.target.value)}
        style={{
          marginTop: "10px",
          padding: "10px",
          width: "100%",
          maxWidth: "380px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />

      {/* Menu inferior */}
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "16px",
          listStyle: "none",
          marginTop: "12px",
          padding: 0,
        }}
      >
        {items.map((item) => (
          <li
            key={item.rota}
            style={{
              cursor: "pointer",
              fontSize: "15px",
              padding: "5px 8px",
              borderRadius: "6px",
            }}
            onClick={() => {
              if (!projeto.trim()) {
                alert("Digite o nome do projeto primeiro!");
                return;
              }
              navigate(item.rota);
            }}
          >
            {item.nome}
          </li>
        ))}
      </ul>
    </nav>
  );
        }
