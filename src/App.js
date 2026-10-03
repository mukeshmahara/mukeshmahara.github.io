import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import ParticleBackground from "./Components/ParticleBackground";
import Projects from "./Components/Projects";
import Intro from "./Components/Intro";
import Experience from "./Components/Experience";
import Education from "./Components/Education";
import Skills from "./Components/Skills";
import Achievements from "./Components/Achievements";
import Sidebar from "./Components/Sidebar";
import ChatBot from "./Components/ChatBot";
import CouponCheckerComponent from "./Components/CouponCheckerComponent";
import DrawsPage from "./Components/ird/DrawsPage";
import Chat from "../src/features/chat/Chat";
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

          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/education" element={<Education />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route
              path="/coupon-checker"
              element={<CouponCheckerComponent />}
            />
            <Route
              path="/voice-assistant"
              element={
                <div className="content-section">
                  <h2>AI Assistant</h2>
                  <p>
                    The floating AI assistant is available on every page. Click
                    the avatar in the bottom right to start a voice command.
                  </p>
                </div>
              }
            />
            <Route path="/draws" element={<DrawsPage />} />
            <Route path="/chat" element={<Chat />} />

            {/* Unknown URL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ChatBot />
        </main>
      </div>
    </div>
  );
}

export default App;
