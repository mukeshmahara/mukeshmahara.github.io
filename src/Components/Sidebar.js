import React from "react";

const Sidebar = ({ activeSection, setActiveSection, closeMenu }) => {
  const handleNavClick = (section, e) => {
    console.log("Navigation clicked:", section); // Debug log
    setActiveSection(section);
    if (closeMenu) {
      console.log("Closing mobile menu"); // Debug log
      closeMenu(); // Close mobile menu after navigation
    }
  };

  const handleTouchEnd = (section, e) => {
    e.preventDefault();
    console.log("Navigation touched:", section); // Debug log
    handleNavClick(section, e);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="mm-logo profile-logo">
          <div className="m-left">M</div>
          <div className="m-right">M</div>
        </div>
        <h3>Mukesh Mahara</h3>
      </div>

      <nav className="sidebar-nav">
        <div role="menu">
          <button
            type="button"
            className={`nav-button ${activeSection === "intro" ? "active" : ""}`}
            onClick={(e) => handleNavClick("intro", e)}
            onTouchEnd={(e) => handleTouchEnd("intro", e)}
          >
            Intro
          </button>
          <button
            type="button"
            className={`nav-button ${activeSection === "projects" ? "active" : ""}`}
            onClick={(e) => handleNavClick("projects", e)}
            onTouchEnd={(e) => handleTouchEnd("projects", e)}
          >
            Projects
          </button>
          <button
            type="button"
            className={`nav-button ${activeSection === "experience" ? "active" : ""}`}
            onClick={(e) => handleNavClick("experience", e)}
            onTouchEnd={(e) => handleTouchEnd("experience", e)}
          >
            Work Experience
          </button>
          <button
            type="button"
            className={`nav-button ${activeSection === "education" ? "active" : ""}`}
            onClick={(e) => handleNavClick("education", e)}
            onTouchEnd={(e) => handleTouchEnd("education", e)}
          >
            Education
          </button>
          <button
            type="button"
            className={`nav-button ${activeSection === "skills" ? "active" : ""}`}
            onClick={(e) => handleNavClick("skills", e)}
            onTouchEnd={(e) => handleTouchEnd("skills", e)}
          >
            Skills
          </button>
          <button
            type="button"
            className={`nav-button ${activeSection === "achievements" ? "active" : ""}`}
            onClick={(e) => handleNavClick("achievements", e)}
            onTouchEnd={(e) => handleTouchEnd("achievements", e)}
          >
            Achievements
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <p>&copy; {new Date().getFullYear()} Mukesh Mahara</p>
      </div>
    </div>
  );
};

export default Sidebar;
