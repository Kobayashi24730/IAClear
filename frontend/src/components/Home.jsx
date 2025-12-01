import { useEffect, useState } from "react";
import Logo from "../assets/imgs/Logo1.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [hovered, setHovered] = useState(null);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  const ensinos = [
    { titulo: "Habilidades técnicas", paragrafo: "Aprenda conceitos fundamentais da Física com exemplos reais e aplicações práticas." },
    { titulo: "Criatividade", paragrafo: "Estimule sua mente com atividades e desafios que desenvolvem sua lógica científica." },
    { titulo: "Composição visual", paragrafo: "Entenda a organização dos elementos do estudo para absorver conteúdos com mais clareza." },
    { titulo: "Experiência certificada", paragrafo: "Conteúdo verificado e revisado para garantir o aprendizado mais eficiente possível." }
  ];

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = prefersDark
    ? { bg: "#0e0f0f", card: "#141515", text: "white" }
    : { bg: "#f4f4f4", card: "white", text: "#111" };

  const styles = {
    page: {
      scrollBehavior: "smooth",
      width: "100%",
      minHeight: "100vh",
      background: theme.bg,
      color: theme.text,
      fontFamily: "Arial, sans-serif",
      overflowX: "hidden",
    },

    hero: {
      width: "100%",
      minHeight: "65vh",
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.6), ${theme.bg}), url("https://images.unsplash.com/photo-1519682337058-a94d519337bc")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "15px",
      opacity: animate ? 1 : 0,
      transform: animate ? "translateX(0)" : "translateX(-50px)",
      transition: "all 0.8s ease",
    },

    heroLogo: { width: 120, marginBottom: 10 },

    heroTitle: {
      fontSize: "38px",
      fontWeight: "bold",
      marginBottom: 15,
      opacity: animate ? 1 : 0,
      transform: animate ? "translateX(0)" : "translateX(-50px)",
      transition: "all 0.8s ease 0.2s",
    },

    heroText: {
      maxWidth: "600px",
      fontSize: "17px",
      opacity: animate ? 0.8 : 0,
      lineHeight: "26px",
      transform: animate ? "translateX(0)" : "translateX(-50px)",
      transition: "all 0.8s ease 0.4s",
    },

    buttonRow: {
      marginTop: 25,
      display: "flex",
      gap: "15px",
      opacity: animate ? 1 : 0,
      transform: animate ? "translateX(0)" : "translateX(-50px)",
      transition: "all 0.8s ease 0.6s",
    },

    greenBtn: {
      padding: "12px 25px",
      background: "#4ade80",
      border: "none",
      borderRadius: "7px",
      fontSize: "16px",
      cursor: "pointer",
      transition: "0.3s",
    },

    curve: {
      width: "100%",
      height: "80px",
      background: theme.bg,
      clipPath: "ellipse(70% 100% at 50% 0%)",
      marginTop: "-40px",
    },

    section: {
      padding: "40px 20px",
      textAlign: "center",
    },

    sectionTitle: {
      fontSize: "32px",
      fontWeight: "bold",
      marginBottom: "15px",
      opacity: animate ? 1 : 0,
      transform: animate ? "translateX(0)" : "translateX(50px)",
      transition: "all 0.8s ease 0.8s",
    },

    ensinoGrid: {
      marginTop: 30,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      padding: "0 10px",
    },

    ensinoCard: {
      background: theme.card,
      padding: "20px",
      borderRadius: "15px",
      transition: "0.3s",
      cursor: "pointer",
      border: "1px solid #222",
      opacity: animate ? 1 : 0,
      transform: animate ? "translateY(0)" : "translateY(20px)",
    },

    ensinoCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 0 15px rgba(0,255,120,0.2)",
    },

    footer: {
      marginTop: 60,
      padding: "40px 20px",
      background: "#111",
      color: "white",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      opacity: animate ? 1 : 0,
      transform: animate ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s ease 1s",
    },

    footerLogoBox: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    footerLogo: {
      width: "60px",
      borderRadius: "10px",
    },

    footerTitle: {
      fontSize: "20px",
    },
  };

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Domine a Física com a HogIA</h1>
        <p style={styles.heroText}>
          Aprenda conceitos fundamentais de forma prática, intuitiva e direcionada para vestibulares.
        </p>
        <div style={styles.buttonRow}>
          <button style={styles.greenBtn} onClick={() => navigate("/Como-Usar")}>
            ❓ Tirar dúvidas
          </button>
        </div>
      </section>

      <div style={styles.curve}></div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Aprenda com conteúdo 100% verificado</h2>
        <div style={styles.ensinoGrid}>
          {ensinos.map((ensino, i) => (
            <div
              key={i}
              style={{
                ...styles.ensinoCard,
                ...(hovered === i ? styles.ensinoCardHover : {}),
                transitionDelay: `${0.2 * i}s`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <h3>{ensino.titulo}</h3>
              <p>{ensino.paragrafo}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerLogoBox}>
          <img src={Logo} style={styles.footerLogo} />
          <h2 style={styles.footerTitle}>HogIA</h2>
        </div>
        <div>
          <h3>Sobre nós</h3>
          <p>Aprendizado rápido, moderno e direcionado para estudantes do Brasil inteiro.</p>
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
