import { useState } from "react";
import CardFlutuante from "./AIPage.jsx";

export default function Navbar({ userId }) {
  const [open, setOpen] = useState(false);
  const [rota, setRota] = useState("");
  const [projeto, setProjeto] = useState("");
  const [historico, setHistorico] = useState([]);

  function adicionarPesquisa(texto) {
    setHistorico(prev => [...prev, texto]);
  }

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
	    justifyContent: "space-between",
	    alignItems: "center",
	    background: "#fff",
	    padding: "15px 16px",  // <—— padding igual dos dois lados
	    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
	    position: "relative"
	  }}
	>
      <input
        placeholder="Nome do projeto..."
        value={projeto}
        onChange={e => setProjeto(e.target.value)}
        style={{
          padding: "10px",
          width: "250px",
          borderRadius: "10px",
          border: "1px solid #ccc"
        }}
      />

      <ul style={{ display: "flex", gap: "20px", listStyle: "none" }}>
        {items.map((item) => (
          <li
			  key={item.rota}
			  style={{ cursor: "pointer" }}
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
