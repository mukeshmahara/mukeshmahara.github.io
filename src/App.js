import { useState, useEffect } from 'react';
import './App.css';
import ParticleBackground from './Components/ParticleBackground';
import Projects from './Components/Projects';
import Intro from './Components/Intro';
import Experience from './Components/Experience';
import Education from './Components/Education';
import Skills from './Components/Skills';
import Achievements from './Components/Achievements';
import Sidebar from './Components/Sidebar';

function App() {
  const [activeSection, setActiveSection] = useState('intro');
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  };

  const closeMenu = () => {
    console.log('closeMenu called, menuOpen:', menuOpen); // Debug log
    setMenuOpen(false);
    document.body.classList.remove('mobile-menu-open');
  };

  useEffect(() => {
    // Fix for mobile viewport height (addressing the 100vh issue on mobile)
    const setVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);

    return () => {
      window.removeEventListener('resize', setVh);
    };
  }, []);
  // Content to display based on selected section
  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return <Intro />;
      case 'projects':
        return (
          
            <Projects />
          
        );
      case 'experience':
        return <Experience />;
      case 'education':
        return <Education />;
      case 'skills':
        return <Skills />;
      case 'achievements':
        return <Achievements />;
      default:
        return (
          <div className="content-section">
            <h2>Welcome</h2>
            <p>Select a section from the sidebar to view more information.</p>
          </div>
        );
    }
  };


  return (
    <div className="App">
      <ParticleBackground />
      <button className="mobile-menu-toggle" onClick={toggleMenu}>
        <span></span>
      </button>
      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

      <div className="layout">
        {/* Sidebar */}
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          closeMenu={closeMenu}
        />

        {/* Main Content */}
        <main className="content">
          <ParticleBackground />

          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;