import React from 'react';

const Experience = () => {
  return (
    <div className="content-section">
      <h2>Work Experience</h2>

      <div className="experience-item">
        <div className="experience-header">
          <h3>Senior Software Engineer</h3>
          <div className="company-info">
            <span className="company-name">U & J Enterprise Inc.</span>
            <span className="location">North Paul, Minnesota, USA</span>
          </div>
          <div className="duration">11/2024 - present</div>
        </div>
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

      <div className="experience-item">
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
};

export default Experience;
