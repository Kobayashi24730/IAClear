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

  // Ajuste de padding do conteúdo EXATO à altura da navbar
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
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        padding: "10px 12px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      {/* INPUT DO PROJETO */}
      <input
        placeholder="Digite o nome do projeto..."
        value={projeto}
        onChange={(e) => setProjeto(e.target.value)}
        style={{
          padding: "8px",
          width: "180px",
          borderRadius: "8px",
          border: "1px solid #bbb",
          fontSize: "14px",
          flexShrink: 0,
        }}
      />

      {/* MENU */}
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {items.map((item) => (
          <li
            key={item.rota}
            style={{
              cursor: "pointer",
              fontSize: "15px",
              padding: "5px 6px",
              borderRadius: "6px",
              transition: "0.3s",
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
