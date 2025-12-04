import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ projectId }) {
  const [nomeProjeto, setNomeProjeto] = useState(
    localStorage.getItem("nomeProjeto") || ""
  );

  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("nomeProjeto", nomeProjeto);
  }, [nomeProjeto]);

  
  useEffect(() => {
    function updatePad() {
      if (navRef.current) {
        document.documentElement.style.setProperty(
          "--navbar-height",
          navRef.current.offsetHeight + "px"
        );
      }
    }
    updatePad();
    window.addEventListener("resize", updatePad);
    return () => window.removeEventListener("resize", updatePad);
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
        position: "sticky",
        top: "64px", 
        zIndex: 998,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        overflowX: "auto",
      }}
    >
    
      <input
        placeholder="Nome do projeto..."
        value={nomeProjeto}
        onChange={(e) => setNomeProjeto(e.target.value)}
        style={{
          padding: "7px",
          width: "200px",
          borderRadius: "8px",
          border: "1px solid #bbb",
          fontSize: "14px",
          flexShrink: 0,
        }}
      />
      
      <ul
        style={{
          display: "flex",
          flexWrap: "nowrap",
          gap: "14px",
          listStyle: "none",
          padding: 0,
          margin: 0,
          whiteSpace: "nowrap",
        }}
      >
        {items.map((item) => (
          <li
            key={item.rota}
            style={{
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: "6px",
              transition: "0.2s",
              fontSize: "15px",
            }}
            onClick={() => {
              if (!nomeProjeto.trim()) {
                alert("Digite o nome do projeto primeiro!");
                return;
              }
              navigate(item.rota);
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#e9e9e9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {item.nome}
          </li>
        ))}
      </ul>
    </nav>
  );
      }
