import React from 'react';
import ParticleBackground from './ParticleBackground';

const Sidebar = ({ activeSection, setActiveSection }) => {
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
            onClick={() => setActiveSection('intro')}
          >
            Intro
          </li>
          <li
            className={activeSection === 'projects' ? 'active' : ''}
            onClick={() => setActiveSection('projects')}
          >
            Projects
          </li>
          <li
            className={activeSection === 'experience' ? 'active' : ''}
            onClick={() => setActiveSection('experience')}
          >
            Work Experience
          </li>
          <li
            className={activeSection === 'education' ? 'active' : ''}
            onClick={() => setActiveSection('education')}
          >
            Education
          </li>
          <li
            className={activeSection === 'skills' ? 'active' : ''}
            onClick={() => setActiveSection('skills')}
          >
            Skills
          </li>
          <li
            className={activeSection === 'achievements' ? 'active' : ''}
            onClick={() => setActiveSection('achievements')}
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
