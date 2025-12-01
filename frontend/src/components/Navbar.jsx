import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [projeto, setProjeto] = useState("");
  const navigate = useNavigate();

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
        width: "100vw",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        padding: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        gap: "10px",
        boxSizing: "border-box",
        margin: 0,
        overflow: "hidden"  
      }}
    >
      <input
        placeholder="Nome do projeto..."
        value={projeto}
        onChange={e => setProjeto(e.target.value)}
        style={{
          padding: "10px",
          flex: "1 1 200px",
          maxWidth: "280px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />

      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "12px",
          listStyle: "none",
          margin: 0,
          padding: 0,
          flex: "1 1 250px",
          textAlign: "center",
          boxSizing: "border-box"
        }}
      >
        {items.map(item => (
          <li
            key={item.rota}
            style={{
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: "14px"
            }}
            onClick={() => {
              if (!projeto.trim()) {
                alert("Digite o nome do projeto primeiro!");
                return;
              }

              navigate(item.rota, {
                state: { projeto }
              });
            }}
          >
            {item.nome}
          </li>
        ))}
      </ul>
    </nav>
  );
          }
