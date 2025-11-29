import React, { useState } from "react";

export default function ComoUsar({fechar}) {
  const [open, setOpen] = useState({
    resumo: true,
    passoAPasso: true,
    exemplos: false,
    faq: false,
  });

  const exemplos = [
    {
      titulo: "Visão Geral",
      texto: "Faça um resumo executivo de até 200 palavras sobre o projeto: [NOME_PROJETO].",
    },
    {
      titulo: "Materiais",
      texto: "Liste 8 materiais de baixo custo para [NOME_PROJETO], com breve justificativa de uso.",
    },
    {
      titulo: "Montagem",
      texto: "Explique em 6 passos como montar o protótipo básico de [NOME_PROJETO].",
    },
    {
      titulo: "Relatório (gerar)",
      texto:
        "Gere um relatório técnico profissional sobre [NOME_PROJETO] cobrindo: introdução, objetivos, materiais, procedimentos, resultados esperados e conclusões.",
    },
  ];

  function toggle(key) {
    setOpen((s) => ({ ...s, [key]: !s[key] }));
  }

  async function copiar(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Texto copiado para a área de transferência!");
    } catch {
      alert("Não foi possível copiar — permita o uso da área de transferência.");
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Como usar a IA — Guia rápido</h1>
        <p style={styles.subtitle}>
          Digite o nome do projeto na barra superior, escolha uma seção (Visão Geral, Materiais, Montagem,
          Procedimento ou Relatório), faça perguntas e gere seu relatório em PDF.
        </p>
      </div>

      {/* Resumo curto */}
      <Section
        title="Resumo"
        open={open.resumo}
        onToggle={() => toggle("resumo")}
      >
        <p style={styles.paragraph}>
          A <strong>IA Assistente de Projetos</strong> ajuda você a criar, revisar e documentar projetos rapidamente.
          Digite o nome do projeto, abra uma das seções, faça perguntas e gere um relatório completo com download em PDF.
        </p>
      </Section>

      {/* Passo a passo */}
      <Section
        title="Passo a passo (Rápido)"
        open={open.passoAPasso}
        onToggle={() => toggle("passoAPasso")}
      >
        <ol style={styles.ol}>
          <li><strong>Digite o nome do projeto</strong> na barra superior (ex.: Sistema de irrigação sustentável).</li>
          <li><strong>Abra uma rota</strong> (Visão Geral / Materiais / Montagem / Procedimento / Relatório).</li>
          <li><strong>Faça uma pergunta</strong> no textarea da rota (ex.: "Quais materiais baratos usar?").</li>
          <li><strong>Envie</strong> (Perguntar / Buscar / Gerar) e aguarde a resposta no card flutuante.</li>
          <li><strong>As perguntas são salvas</strong> no histórico e usadas para montar o relatório.</li>
          <li>No menu <strong>Relatório</strong>, clique em <em>Gerar Relatório Completo</em> para compor o documento.</li>
          <li>Clique em <strong>Baixar PDF</strong> para salvar o relatório gerado.</li>
        </ol>
        <div style={styles.tipBox}>
          <strong>Dica:</strong> Perguntas específicas geram respostas mais úteis (ex.: “Liste 5 materiais recicláveis com custo estimado”).
        </div>
      </Section>

      {/* Exemplos */}
      <Section
        title="Exemplos prontos (copiar)"
        open={open.exemplos}
        onToggle={() => toggle("exemplos")}
      >
        {exemplos.map((ex, idx) => (
          <div key={idx} style={styles.example}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <strong>{ex.titulo}</strong>
              <button style={styles.copyBtn} onClick={() => copiar(ex.texto)}>Copiar</button>
            </div>
            <p style={styles.small}>{ex.texto}</p>
          </div>
        ))}
      </Section>

      {/* FAQ */}
      <Section
        title="Perguntas frequentes / Solução de problemas"
        open={open.faq}
        onToggle={() => toggle("faq")}
      >
        <div style={styles.faqItem}>
          <strong>Q: A IA fica carregando sem responder?</strong>
          <p>A: Verifique se o backend (FastAPI) está rodando e que o campo "Nome do projeto" não está vazio. No celular, confirme que o BASE_URL usa o IP do PC na mesma rede (ex.: http://192.168.0.15:8000).</p>
        </div>

        <div style={styles.faqItem}>
          <strong>Q: O PDF não baixa (404)?</strong>
          <p>A: Verifique se a rota <code>/relatorio/pdf</code> existe no backend e se o serviço foi reiniciado após a alteração.</p>
        </div>

        <div style={styles.faqItem}>
          <strong>Q: Como obter respostas mais técnicas?</strong>
          <p>A: Use prompts mais específicos, por exemplo: "Liste 5 materiais recicláveis com custo por unidade e uso recomendado".</p>
        </div>
      </Section>

      {/* Footer quick actions */}
      <div style={styles.footer}>
        <button style={styles.primary} onClick={() => toggle("passoAPasso")}>Abrir Passo a Passo</button>
        <button style={styles.secondary} onClick={() => { setOpen({ resumo:true, passoAPasso:true, exemplos:true, faq:true }); }}>Abrir tudo</button>
      </div>
    </div>
  );
}

/* Small Section component */
function Section({ title, children, open, onToggle }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader} onClick={onToggle}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        <button style={styles.toggleBtn}>{open ? "▾" : "▸"}</button>
      </div>
      {open && <div style={styles.sectionBody}>{children}</div>}
    </div>
  );
}

/* Styles (clean / Windows-like) */
const styles = {
  container: {
    width: "100%",
    maxWidth: 920,
    margin: "16px auto",
    padding: 20,
    boxSizing: "border-box",
    fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
    color: "#111",
    background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(245,245,245,0.95))",
    borderRadius: 12,
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
  },
  header: { marginBottom: 12 },
  title: { margin: 0, fontSize: 20 },
  subtitle: { marginTop: 6, color: "#333", fontSize: 14 },
  section: {
    marginTop: 14,
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)",
    background: "#fff"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    cursor: "pointer",
    background: "linear-gradient(180deg, #f7f7f7, #f2f2f2)"
  },
  sectionTitle: { margin: 0, fontSize: 15 },
  toggleBtn: {
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
    color: "#333"
  },
  sectionBody: { padding: 14, color: "#222", lineHeight: 1.5 },
  paragraph: { margin: 0, fontSize: 14 },
  ol: { paddingLeft: 18, margin: "8px 0" },
  tipBox: {
    marginTop: 10,
    padding: 10,
    background: "#eef6ff",
    borderRadius: 8,
    border: "1px solid #d6eaf7",
    color: "#044a86",
    fontSize: 13
  },
  example: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    background: "#fafafa",
    border: "1px solid rgba(0,0,0,0.04)"
  },
  small: { margin: "6px 0 0", fontSize: 13, color: "#333", whiteSpace: "pre-wrap" },
  copyBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#0078d4",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13
  },
  faqItem: { marginBottom: 12 },
  footer: { display: "flex", gap: 10, marginTop: 16 },
  primary: {
    padding: "10px 14px",
    borderRadius: 10,
    background: "#0078d4",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  },
  secondary: {
    padding: "10px 14px",
    borderRadius: 10,
    background: "#f0f0f0",
    color: "#333",
    border: "1px solid #ddd",
    cursor: "pointer"
  }
};
