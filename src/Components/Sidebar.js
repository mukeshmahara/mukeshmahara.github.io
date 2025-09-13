import React from 'react';
import ParticleBackground from './ParticleBackground';

const Sidebar = ({ activeSection, setActiveSection, closeMenu }) => {
  const handleNavClick = (section) => {
    setActiveSection(section);
    if (closeMenu) {
      closeMenu(); // Close mobile menu after navigation
    }
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
        <ParticleBackground />
        <ul>
          <li 
            className={activeSection === "intro" ? "active" : ""} 
            onClick={() => handleNavClick('intro')}
          >
            Intro
          </li>
          <li
            className={activeSection === 'projects' ? 'active' : ''}
            onClick={() => handleNavClick('projects')}
          >
            Projects
          </li>
          <li
            className={activeSection === 'experience' ? 'active' : ''}
            onClick={() => handleNavClick('experience')}
          >
            Work Experience
          </li>
          <li
            className={activeSection === 'education' ? 'active' : ''}
            onClick={() => handleNavClick('education')}
          >
            Education
          </li>
          <li
            className={activeSection === 'skills' ? 'active' : ''}
            onClick={() => handleNavClick('skills')}
          >
            Skills
          </li>
          <li
            className={activeSection === 'achievements' ? 'active' : ''}
            onClick={() => handleNavClick('achievements')}
          >
            Achievements
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>&copy; {new Date().getFullYear()} Mukesh Mahara</p>
      </div>
    </div>
  );
};

export default Sidebar;
