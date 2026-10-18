import { Routes, Route, Navigate } from "react-router-dom";

import Projects from "../Components/Projects";
import Intro from "../Components/Intro";
import Experience from "../Components/Experience";
import Education from "../Components/Education";
import Skills from "../Components/Skills";
import Achievements from "../Components/Achievements";
import CouponCheckerComponent from "../Components/CouponCheckerComponent";
import DrawsPage from "../Components/ird/DrawsPage";
import Chat from "../features/chat/Chat";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/experience" element={<Experience />} />
      <Route path="/education" element={<Education />} />
      <Route path="/skills" element={<Skills />} />
      <Route path="/achievements" element={<Achievements />} />

      <Route path="/coupon-checker" element={<CouponCheckerComponent />} />

      <Route
        path="/voice-assistant"
        element={
          <div className="content-section">
            <h2>AI Assistant</h2>
            <p>
              The floating AI assistant is available on every page. Click the
              avatar in the bottom right to start a voice command.
            </p>
          </div>
        }
      />

      <Route path="/draws" element={<DrawsPage />} />
      <Route path="/chat" element={<Chat />} />

      {/* Redirect unknown URLs to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
