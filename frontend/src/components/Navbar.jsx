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
        width: "100%",            
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        padding: "12px 16px",       
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        boxSizing: "border-box"
      }}
    >
      <input
        placeholder="Nome do projeto..."
        value={projeto}
        onChange={e => setProjeto(e.target.value)}
        style={{
          padding: "10px",
          width: "260px",
          maxWidth: "100%",
          borderRadius: "10px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "15px",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {items.map(item => (
          <li
            key={item.rota}
            style={{
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: "15px",
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
