import { useState, useEffect } from 'react';
import logo from './mukesh_profile.jpg';
import './App.css';
import { Typewriter } from 'react-simple-typewriter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faQuora, faGithub, faStackOverflow, faMedium, faInstagram } from '@fortawesome/free-brands-svg-icons';
import ParticleBackground from './Components/ParticleBackground';
import Projects from './Components/Projects';

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
        return (
          <div className="content-section">
            <ParticleBackground />
            <h2>Intro</h2>
            <div className="intro-section">
              <div className="profile-header">
                <div className="profile-image">
                  {/* Replace with your actual profile image */}
                  <img src={logo} alt="Mukesh Mahara" className="profile-pic" />
                </div>
                <div className="profile-info">
                  <h1>Mukesh Mahara</h1>
                  <div className="typewriter-container">
                    I'm a
                    <Typewriter
                      words={[
                        '  Software Engineer',
                        ' 🚀 Full-Stack Ruby on Rails Developer',
                        ' Builder of Scalable Web Applications',
                        ' Rails Enthusiast ',
                      ]}
                      loop={true}
                      cursor
                      cursorStyle='|'
                      typeSpeed={70}
                      deleteSpeed={50}
                      delaySpeed={1000}
                    />
                  </div>
                  <p>
                    Creative and results-driven developer with a passion for turning complex workflows into intuitive, efficient digital solutions. With hands-on experience in Ruby on Rails, Solid Queue, and modern frontend tools like Stimulus, Flowbite, and DataTables, I specialize in crafting high-performance web apps—from healthcare systems to shipping logistics platforms. Whether architecting backend logic or designing clean, responsive UIs, I thrive on building products that are both powerful and user-friendly.
                    Always shipping. Always learning. Always leveling up.
                  </p>
                </div>
              </div>

              <div className="contact-info">
                <div className="contact-row">
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <a href="mailto:mukeshmahara1@gmail.com" className="contact-link">
                      <span>mukeshmahara1@gmail.com</span>
                    </a>
                  </div>
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faPhone} />
                    <a href="tel:+9779867772852" className="contact-link">
                      <span>9867772852</span>
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt}  />
                    <span className="contact-link">Kathmandu, Nepal</span>
                  </div>
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faGlobe} />
                    <a href="https://www.mukeshmahara.com.np" target="_blank" rel="noopener noreferrer" className="contact-link">
                      <span>www.mukeshmahara.com.np</span>
                    </a>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faLinkedin} />
                    <a href="https://linkedin.com/in/mukesh-mahara-94b4a4142" target="_blank" rel="noopener noreferrer" className="contact-link">
                      <span>linkedin.com/in/mukesh-mahara-94b4a4142</span>
                    </a>
                  </div>
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faQuora} />
                    <a href="https://quora.com/profile/Mukesh-Mahara" target="_blank" rel="noopener noreferrer" className="contact-link">
                      <span>quora.com/profile/Mukesh-Mahara</span>
                    </a>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faGithub} />
                    <a href="https://github.com/mukeshmahara" target="_blank" rel="noopener noreferrer" className="contact-link">
                      <span>github.com/mukeshmahara</span>
                    </a>
                  </div>
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faStackOverflow} />
                    <a href="https://stackoverflow.com/users/7989332/mukesh-mahara" target="_blank" rel="noopener noreferrer" className="contact-link">
                      <span>stackoverflow.com/users/7989332/mukesh-mahara</span>
                    </a>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faMedium} />
                    <a href="https://medium.com/@mukeshmahara1" target="_blank" rel="noopener noreferrer" className="contact-link">
                      <span>medium.com/@mukeshmahara1</span>
                    </a>
                  </div>
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faInstagram} />
                    <a href="https://instagram.com/mukeshmahara" target="_blank" rel="noopener noreferrer" className="contact-link">
                      <span>instagram.com/mukeshmahara</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        )
      case 'projects':
        return (
          <div className="content-section">
            <h2>My Projects</h2>
            <Projects />
          </div>
        );
      case 'experience':
        return (
          <div className="content-section">
            <h2>Work Experience</h2>

            <div className="experience-item">
              <div className="experience-header">
                <h3>Senior Software Engineer</h3>
                <div className="company-info">
                  <span className="company-name">U & J Enterprise Inc.</span>
                  <span className="location">North Paul, Minescota,  USA</span>
                </div>
                <div className="duration">11/2024 - present</div>

                <div className="responsibilities">
                  <ul>
                    <li>ListEngine Development for auction platform</li>
                    <li>Review PR and integrate new features to dev, staging and production</li>
                    <li>Design database schema, restful API and backend services</li>
                    <li>Improve code quality and debug fix vulnerability in existing code base</li>
                    <li>Integrated third-party applications into existing software, enhancing features and performance</li>
                    <li>Managing deployment pipelines using tools like Capistrano, Docker, or CI/CD services and monitoring the application in production</li>
                  </ul>
                </div>
                <div className="contact-reference">
                  <p>Contact: CEO Ummid Lohani - +14431135281</p>
                </div>
              </div>


              <div className="experience-header">
                <h3>Software Engineer</h3>
                <div className="company-info">
                  <span className="company-name">ITmaximize Inc.</span>
                  <span className="location">Parkville, Maryland, USA</span>
                </div>
                <div className="duration">05/2022 - 09/2024</div>
              </div>
              <div className="responsibilities">
                <ul>
                  <li>Written clean and readable feature tests using RSpec</li>
                  <li>Review PR and integrate new features to production</li>
                  <li>Design database schema, restful API and backend services</li>
                  <li>Improve code quality and debug fix vulnerability in existing code base</li>
                  <li>Integrated third-party applications into existing software, enhancing features and performance</li>
                  <li>Managing deployment pipelines using tools like Capistrano, Docker, or CI/CD services and monitoring the application in production</li>
                </ul>
              </div>
              <div className="contact-reference">
                <p>Contact: CEO Umesh Bastola - +14431135281</p>
              </div>
            </div>

            <div className="experience-item">
              <div className="experience-header">
                <h3>Ruby on Rails Developer</h3>
                <div className="company-info">
                  <span className="company-name">Danphe Software Lab</span>
                  <span className="location">Kathmandu, Nepal</span>
                </div>
                <div className="duration">10/2021 - 04/2022</div>
              </div>
              <div className="responsibilities">
                <ul>
                  <li>Creating efficient back-end model design and development</li>
                  <li>Building reusable front-end components using react</li>
                  <li>Provided weekly detailed project reports to keep manager informed on milestones and updates</li>
                </ul>
              </div>
              <div className="contact-reference">
                <p>Contact: Saroj Khatiwada - +9779851153385</p>
              </div>
            </div>

            <div className="experience-item">
              <div className="experience-header">
                <h3>Associate Software Engineer</h3>
                <div className="company-info">
                  <span className="company-name">Idea Breed Technology</span>
                  <span className="location">Kathmandu, Nepal</span>
                </div>
                <div className="duration">05/2021 - 09/2021</div>
              </div>
              <div className="responsibilities">
                <ul>
                  <li>Design and develop front-end component and API</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'education':
        return (
          <div className="content-section">
            <h2>Education</h2>

            <div className="education-item">
              <div className="education-header">
                <h3>Computer Science and Information Technology</h3>
                <div className="school-info">
                  <span className="school-name">Madan Bhandari Memorial College</span>
                  <span className="location">Bhaktapur, Kathmandu, Nepal</span>
                </div>
                <div className="duration">06/2016 - 07/2020</div>
              </div>
            </div>

            <div className="education-item">
              <div className="education-header">
                <h3>Science</h3>
                <div className="school-info">
                  <span className="school-name">Radiant Higher Secondary School</span>
                  <span className="location">Bhimfedistanpat, Kathmandu</span>
                </div>
                <div className="duration">04/2013 - 12/2015</div>
              </div>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="content-section">
            <h2>Skills</h2>

            <div className="skills-container">
              <div className="skill-tag">Ruby</div>
              <div className="skill-tag">Ruby on Rails</div>
              <div className="skill-tag">Next.js</div>
              <div className="skill-tag">JavaScript</div>
              <div className="skill-tag">REST API</div>
              <div className="skill-tag">Docker</div>
              <div className="skill-tag">MySQL</div>
              <div className="skill-tag">PostgreSQL DB</div>
              <div className="skill-tag">React</div>
              <div className="skill-tag">SASS</div>
              <div className="skill-tag">Bootstrap</div>
              <div className="skill-tag">CI/CD Pipeline</div>
              <div className="skill-tag">Deployments</div>
              <div className="skill-tag">Test and Automation</div>
              <div className="skill-tag">Rspec</div>
            </div>
          </div>
        );
      case 'achievements':
        return (
          <div className="content-section">
            <h2>Achievements</h2>

            <div className="achievement-item">
              <h3>Member of Developer Circle Kathmandu</h3>
              <p className="duration">08/2019 - Present</p>
            </div>

            <div className="achievement-item">
              <h3>Member of LEO Club of Mahakali Classic</h3>
              <p className="duration">07/2024 - Present</p>
            </div>
          </div>
        );
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
        <div className="sidebar">

          <div className="sidebar-header">
            <div class="mm-logo profile-logo">
              <div class="m-left">M</div>
              <div class="m-right">M</div>
            </div>
            <h3>Mukesh Mahara</h3>
          </div>

          <nav className="sidebar-nav">
            <ParticleBackground />
            <ul>
              <li className={activeSection === "intro" ? "active" : ""} onClick={() => setActiveSection('intro')}>
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