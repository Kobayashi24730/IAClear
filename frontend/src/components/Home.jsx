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
        "A IA explica as Três Leis de Newton com exemplos claros, simulações, aplicações no dia a dia e exercícios gerados sob demanda."
    },
    { 
      titulo: "Conteúdo realmente confiável",
      paragrafo:
        "A IA consulta livros acadêmicos, bases científicas e artigos revisados (como SciELO, NCBI, Scholar) para montar respostas seguras."
    },
    { 
      titulo: "Aprendizado baseado em dados reais",
      paragrafo:
        "O modelo cruza informações de múltiplas fontes, identifica padrões e retorna explicações adaptadas ao nível do usuário."
    },
    { 
      titulo: "Ideal para estudos e professores",
      paragrafo:
        "Perfeito para revisar para provas, criar resumos, gerar experimentos, montar planos de aula e tirar dúvidas complexas."
    }
  ];

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const theme = {
    bg: "#f4f4f4",
    card: "#ffffff",
    text: "#111111",
    btn: "#0078D4",
    btnHover: "#005A9E",
    header: "#ffffff",
  };

  const styles = {
    page: {
      width: "100vw",
      minHeight: "100vh",
      background: theme.bg,
      color: theme.text,
      fontFamily: "Segoe UI, Arial, sans-serif",
      overflowX: "hidden",
    },

    hero: {
      width: "100vw",
      minHeight: "100vh",
      backgroundImage: `
        linear-gradient(
          to bottom,
          rgba(244,244,244,0.75),
          rgba(244,244,244,0.95)
        ),
        url("https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80")
      `,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "0 20px",
      opacity: animate ? 1 : 0,
      transform: animate ? "translateY(0)" : "translateY(40px)",
      transition: "all 0.8s ease",
    },

    heroTitle: {
      fontSize: "38px",
      fontWeight: "bold",
      marginBottom: 12,
    },

    heroText: {
      maxWidth: "650px",
      fontSize: "18px",
      lineHeight: "28px",
      opacity: animate ? 1 : 0,
      transition: "all 0.8s ease 0.3s",
    },

    buttonRow: {
      marginTop: 25,
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
    },

    btn: {
      padding: "12px 25px",
      background: theme.btn,
      border: "none",
      borderRadius: "4px",
      fontSize: "16px",
      cursor: "pointer",
      color: "#fff",
      transition: "0.2s",
    },

    section: {
      padding: "50px 0",
      textAlign: "center",
      width: "100vw",
    },

    sectionTitle: {
      fontSize: "30px",
      fontWeight: "bold",
      marginBottom: "20px",
    },

    ensinoGrid: {
      marginTop: 30,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
      gap: "25px",
      padding: "0 30px",              
      width: "100%",
      maxWidth: "1150px",
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",
    },

    ensinoCard: {
      background: theme.card,
      padding: "20px",
      borderRadius: "7px",
      border: "1px solid #ccc",
      transition: "0.3s",
      cursor: "pointer",
    },

    ensinoCardHover: {
      transform: "translateY(-4px)",
      boxShadow: "0 3px 14px rgba(0,0,0,0.15)",
    },

    footer: {
      marginTop: 60,
      padding: "40px 25px",
      background: "#ececec",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "25px",
      width: "100vw",
    },

    footerLogoBox: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    footerLogo: {
      width: "60px",
      borderRadius: "10px",
    },

    footerTitle: {
      fontSize: "20px",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.page}>
      
      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Domine a Física com a HogIA</h1>

        <p style={styles.heroText}>
          A HogIA utiliza modelos avançados para interpretar livros didáticos,
          artigos científicos e bancos de dados educacionais.  
          Ela explica as Leis de Newton com clareza, gera exemplos, exercícios,
          projetos e até experimentos que você pode realizar em casa.
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

      {/* CARDS */}
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

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLogoBox}>
          <img src={Logo} style={styles.footerLogo} />
          <h2 style={styles.footerTitle}>HogIA</h2>
        </div>

        <div>
          <h3>Sobre nós</h3>
          <p>
            A IA que ensina Física com clareza, precisão e metodologia baseada em fontes reais.
            Transformamos estudo em aprendizado verdadeiro.
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
