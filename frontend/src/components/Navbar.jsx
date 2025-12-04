import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [projeto, setProjeto] = useState(localStorage.getItem("projeto") || "");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("projeto", projeto);
    window.dispatchEvent(new Event("projetoAtualizado"));
  }, [projeto]);

  useEffect(() => {
    document.body.style.paddingTop = "95px";
    return () => {
      document.body.style.paddingTop = "0px";
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
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#fff",
        padding: "12px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <input
        placeholder="Nome do projeto..."
        value={projeto}
        onChange={(e) => setProjeto(e.target.value)}
        style={{
          padding: "10px",
          width: "260px",
          maxWidth: "100%",
          borderRadius: "10px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      />

      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "14px",
          listStyle: "none",
          margin: 0,
          padding: 0,
          width: "100%",
        }}
      >
        {items.map((item) => (
          <li
            key={item.rota}
            style={{
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: "15px",
              padding: "6px 10px",
              borderRadius: "8px",
              transition: "0.2s",
            }}
            onClick={() => {
              if (!projeto.trim()) {
                alert("Digite o nome do projeto primeiro!");
                return;
              }
              navigate(item.rota);
            }}
            onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            {item.nome}
          </li>
        ))}
      </ul>
    </nav>
  );
     }
