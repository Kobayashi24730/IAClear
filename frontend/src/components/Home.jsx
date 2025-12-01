import { useEffect, useState } from "react";
import Logo from "../assets/imgs/Logo1.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [hovered, setHovered] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [scrollY, setScrollY] = useState(0);
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

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    scrollBehavior: "smooth",
    width: "100vw",
    minHeight: "100vh",
    background: theme.bg,
    color: theme.text,
    fontFamily: "Segoe UI, Arial, sans-serif",
    overflowX: "hidden",
    margin: 0,
    padding: 0,
  },

  hero: {
    width: "100vw",
    minHeight: "100vh",
    backgroundImage: `
      linear-gradient(
        to bottom,
        rgba(244,244,244,0.75) 0%,
        rgba(244,244,244,0.90) 40%,
        rgba(244,244,244,1) 70%,
        ${theme.bg} 100%
      ),
      url("https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80")
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0",
    margin: 0,
    opacity: animate ? 1 : 0,
    transform: animate ? "translateX(0)" : "translateX(-50px)",
    transition: "all 0.8s ease",
    color: theme.text,
  },

  heroLogo: { width: 120, marginBottom: 10 },

  heroTitle: {
    fontSize: "38px",
    fontWeight: "bold",
    marginBottom: 15,
    color: theme.text,
    opacity: animate ? 1 : 0,
    transform: animate ? "translateX(0)" : "translateX(-50px)",
    transition: "all 0.8s ease 0.2s",
  },

  heroText: {
    maxWidth: "600px",
    fontSize: "17px",
    opacity: animate ? 1 : 0,
    lineHeight: "26px",
    color: theme.text,
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

  curve: {
    width: "100vw",
    height: "80px",
    background: theme.bg,
    clipPath: "ellipse(70% 100% at 50% 0%)",
    marginTop: "-40px",
  },

  section: {
    padding: "40px 0",
    textAlign: "center",
    width: "100vw",
    margin: 0,
  },

  sectionTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: theme.text,
    opacity: animate ? 1 : 0,
    transform: animate ? "translateX(0)" : "translateX(50px)",
    transition: "all 0.8s ease 0.8s",
  },

  ensinoGrid: {
    marginTop: 30,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    padding: "0 20px",
    width: "100%",
    maxWidth: "1100px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  ensinoCard: {
    background: theme.card,
    padding: "20px",
    borderRadius: "7px",
    transition: "0.3s",
    cursor: "pointer",
    border: "1px solid #ccc",
    opacity: animate ? 1 : 0,
    transform: animate ? "translateY(0)" : "translateY(20px)",
  },

  ensinoCardHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
  },

  footer: {
    marginTop: 60,
    padding: "40px 20px",
    width: "100vw",
    background: "#f0f0f0",
    color: theme.text,
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
          <button
            style={styles.btn}
            onMouseEnter={(e) => (e.currentTarget.style.background = theme.btnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = theme.btn)}
            onClick={() => navigate("/Como-Usar")}
          >
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
