import React from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faQuora, faGithub, faStackOverflow, faMedium, faInstagram } from '@fortawesome/free-brands-svg-icons';
import ParticleBackground from './ParticleBackground';
import logo from '../mukesh_profile.jpg';

const Intro = () => {
  return (
    <div className="content-section">
      <ParticleBackground />
      <h2>Intro</h2>
      <div className="intro-section">
        <div className="profile-header">
          <div className="profile-image">
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
              <FontAwesomeIcon icon={faMapMarkerAlt} />
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
  );
};

export default Intro;
