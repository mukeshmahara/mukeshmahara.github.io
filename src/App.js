import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

import ParticleBackground from "./Components/ParticleBackground";
import Sidebar from "./Components/Sidebar";
function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);

    if (!menuOpen) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove("mobile-menu-open");
  };

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();

    window.addEventListener("resize", setVh);

    return () => {
      window.removeEventListener("resize", setVh);
    };
  }, []);

  return (
    <div className="App">
      <ParticleBackground />

      <button className="mobile-menu-toggle" onClick={toggleMenu}>
        <span></span>
      </button>

      {menuOpen && <div className="mobile-menu-overlay" onClick={closeMenu} />}

      <div className="layout">
        <Sidebar closeMenu={closeMenu} />

        <main className="content">
          <ParticleBackground />

          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default App;
