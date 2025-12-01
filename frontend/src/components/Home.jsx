import { useEffect, useState } from "react";
import Logo from "../assets/imgs/Logo1.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [hovered, setHovered] = useState(null);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  const ensinos = [
    { 
      titulo: "Precisão nas leis da Física", 
      paragrafo:
        "A IA explica as Três Leis de Newton com exemplos claros, simulações, comparações visuais e exercícios sob demanda."
    },
    { 
      titulo: "Conteúdo realmente confiável",
      paragrafo:
        "A IA consulta livros acadêmicos, bases científicas e artigos revisados (SciELO, NCBI, Scholar) para montar respostas seguras."
    },
    { 
      titulo: "Aprendizado baseado em dados reais",
      paragrafo:
        "O modelo cruza informações de múltiplas fontes e adapta explicações ao seu nível de conhecimento."
    },
    { 
      titulo: "Ideal para estudantes e professores",
      paragrafo:
        "Perfeito para revisar para provas, criar resumos, gerar experimentos, montar planos de aula e tirar dúvidas complexas."
    },
    {
      titulo: "Explicações personalizadas",
      paragrafo:
        "A IA ajusta o tipo de explicação: simples, intermediária ou avançada — dependendo do que você pedir."
    }
  ];

  const porque = [
    {
      titulo: "Transforme seu estudo",
      texto:
        "Ao invés de decorar fórmulas, entenda a Física com clareza e lógica. A HogIA ajuda a criar pensamento científico verdadeiro."
    },
    {
      titulo: "Projetos e experimentos",
      texto:
        "Receba ideias de experimentos caseiros, projetos escolares e aplicações práticas para compreender os conceitos."
    },
    {
      titulo: "Sempre disponível",
      texto:
        "Aprenda na hora que quiser. Tire dúvidas instantaneamente, sem depender de livros longos ou vídeos demorados."
    }
  ];

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflowX = "hidden"; 
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const theme = {
    bg: "#f7f7f7",
    card: "#ffffff",
    text: "#111111",
    btn: "#0078D4",
    btnHover: "#005A9E",
    header: "#ffffff",
  };

  const styles = {
    page: {
      width: "100%",            
      minHeight: "100vh",
      background: theme.bg,
      fontFamily: "Segoe UI, Arial, sans-serif",
      overflowX: "hidden",       
    },

    hero: {
      width: "100%",            
      minHeight: "95vh",
      backgroundImage: `
        linear-gradient(
          to bottom,
          rgba(255,255,255,0.85),
          rgba(255,255,255,0.97)
        ),
        url("https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80")
      `,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "0 20px",
      opacity: animate ? 1 : 0,
      transform: animate ? "translateY(0)" : "translateY(40px)",
      transition: "all 0.8s ease",
      boxSizing: "border-box"
    },

    heroTitle: {
      fontSize: "40px",
      fontWeight: "bold",
      maxWidth: "900px",
      marginBottom: "15px",
    },

    heroText: {
      maxWidth: "760px",
      fontSize: "19px",
      lineHeight: "30px",
      marginTop: "10px",
      opacity: animate ? 1 : 0,
      transition: "all 0.8s ease 0.3s",
    },

    buttonRow: {
      marginTop: 30,
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      flexWrap: "wrap",
    },

    btn: {
      padding: "12px 25px",
      background: theme.btn,
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      cursor: "pointer",
      color: "#fff",
      transition: "0.2s",
    },

    section: {
      padding: "60px 20px",
      textAlign: "center",
      width: "100%",
      boxSizing: "border-box",
    },

    sectionTitle: {
      fontSize: "30px",
      fontWeight: "bold",
      marginBottom: "20px",
    },

    ensinoGrid: {
      marginTop: 30,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "25px",
      padding: "0 25px",
      maxWidth: "1200px",
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",
    },

    ensinoCard: {
      background: theme.card,
      padding: "22px",
      borderRadius: "7px",
      border: "1px solid #ccc",
      transition: "0.3s",
      cursor: "pointer",
      textAlign: "left",
    },

    ensinoCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 3px 14px rgba(0,0,0,0.15)",
    },

    porqueGrid: {
      marginTop: 40,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "25px",
      padding: "0 25px",
      maxWidth: "1200px",
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",
    },

    porqueCard: {
      background: "#ffffff",
      padding: "25px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      textAlign: "center",
    },

    footer: {
      marginTop: 60,
      padding: "50px 25px",
      background: "#e8e8e8",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "35px",
      width: "100%",
      boxSizing: "border-box",
    },

    footerLogoBox: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    footerLogo: {
      width: "62px",
      borderRadius: "10px",
    },

    footerTitle: {
      fontSize: "22px",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.page}>

      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Domine a Física com a HogIA</h1>

        <p style={styles.heroText}>
          A HogIA utiliza modelos avançados para interpretar livros didáticos, artigos
          científicos e bases acadêmicas confiáveis.  
          Ela explica as Leis de Newton com clareza, gera exemplos, exercícios,
          projetos e até experimentos que você pode fazer em casa.
          Tudo no seu ritmo, com explicações que evoluem junto com você.
        </p>

        <div style={styles.buttonRow}>
          <button
            style={styles.btn}
            onMouseEnter={(e) => (e.currentTarget.style.background = theme.btnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = theme.btn)}
            onClick={() => navigate("/como-usar")}
          >
            ❓ Como usar a IA
          </button>
        </div>
      </section>

      {/* CARDS ENSINO */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Aprenda com conteúdo 100% verificado</h2>

        <div style={styles.ensinoGrid}>
          {ensinos.map((ensino, i) => (
            <div
              key={i}
              style={{
                ...styles.ensinoCard,
                ...(hovered === i ? styles.ensinoCardHover : {}),
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <h3>{ensino.titulo}</h3>
              <p style={{ marginTop: 10 }}>{ensino.paragrafo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POR QUE USAR */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Por que usar a HogIA?</h2>

        <div style={styles.porqueGrid}>
          {porque.map((p, i) => (
            <div key={i} style={styles.porqueCard}>
              <h3>{p.titulo}</h3>
              <p style={{ marginTop: 10 }}>{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLogoBox}>
          <img src={Logo} style={styles.footerLogo} />
          <h2 style={styles.footerTitle}>HogIA</h2>
        </div>

        <div>
          <h3>Sobre nós</h3>
          <p>
            A IA que ensina Física com clareza, precisão e metodologia baseada
            em fontes reais. Transformamos estudo em aprendizado verdadeiro.
          </p>
        </div>

        <div>
          <h3>Contato</h3>
          <p>Av. Taltal - João Pessoa - SP</p>
          <p>ajenteduplo000@gmail.com</p>
        </div>
      </footer>

    </div>
  );
      }
