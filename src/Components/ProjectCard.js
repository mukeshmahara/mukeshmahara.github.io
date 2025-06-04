import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const ProjectCard = ({ title, description, image, technologies, githubLink, liveLink }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="project-card">
      <div className="project-image-container">
        {image && <img src={image} alt={title} className="project-image" />}
        <div className="project-image-overlay"></div>
      </div>
      
      <div className="project-content">
        <h3 className="project-title">{title}</h3>
        
        <div className="project-technologies">
          {technologies.map((tech, index) => (
            <span key={index} className="project-tech">{tech}</span>
          ))}
        </div>
        
        <div className={`project-description ${expanded ? 'expanded' : ''}`}>
          <p>{description}</p>
        </div>
        
        {description.length > 150 && (
          <button 
            className="expand-btn" 
            onClick={() => setExpanded(!expanded)}
          >
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
            <span>{expanded ? 'Show Less' : 'Show More'}</span>
          </button>
        )}
        
        <div className="project-links">
          {githubLink && (
            <a href={githubLink} className="project-link github" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faGithub} />
              <span>Code</span>
            </a>
          )}
          
          {liveLink && (
            <a href={liveLink} className="project-link live" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              <span>Live Demo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;