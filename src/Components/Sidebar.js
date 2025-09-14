import React from 'react';

const Sidebar = ({ activeSection, setActiveSection, closeMenu }) => {
  const handleNavClick = (section, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigation clicked:', section); // Debug log
    setActiveSection(section);
    if (closeMenu) {
      console.log('Closing mobile menu'); // Debug log
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
        <ul>
          <li 
            className={activeSection === "intro" ? "active" : ""} 
            onClick={(e) => handleNavClick('intro', e)}
          >
            Intro
          </li>
          <li
            className={activeSection === 'projects' ? 'active' : ''}
            onClick={(e) => handleNavClick('projects', e)}
          >
            Projects
          </li>
          <li
            className={activeSection === 'experience' ? 'active' : ''}
            onClick={(e) => handleNavClick('experience', e)}
          >
            Work Experience
          </li>
          <li
            className={activeSection === 'education' ? 'active' : ''}
            onClick={(e) => handleNavClick('education', e)}
          >
            Education
          </li>
          <li
            className={activeSection === 'skills' ? 'active' : ''}
            onClick={(e) => handleNavClick('skills', e)}
          >
            Skills
          </li>
          <li
            className={activeSection === 'achievements' ? 'active' : ''}
            onClick={(e) => handleNavClick('achievements', e)}
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
