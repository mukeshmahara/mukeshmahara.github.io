import React from 'react';
import ProjectCard from './ProjectCard';
import listengine from '../assets/listengine.png'; // Adjust the import path as necessary
import physio from '../assets/physio.jpg'; // Adjust the import path as necessary
// Sample project data - replace with your actual projects
const projectsData = [
  {
    id: 1,
    title: "ListEngine Auction Platform",
    description: "Developed a high-performance auction platform with real-time bidding, payment integration, and automated notifications. Implemented complex business logic for auction listing, bidder verification, and automated auction closings. The system handles thousands of concurrent users with minimal latency.",
    image: listengine,
    technologies: ["Ruby on Rails", "PostgreSQL", "Redis", "React", "Hotwire"],
    githubLink: "https://github.com/mukeshmahara/auction-platform",
    liveLink: "https://app-react.alistengine.com"
  },
  {
    id: 2,
    title: "Healthcare Management System",
    description: "Built a comprehensive healthcare management system for clinics and small hospitals. Features include patient records management, appointment scheduling, billing integration, and medical reporting. Implemented HIPAA-compliant security measures and data encryption.",
    image: "https://via.placeholder.com/640x360?text=Healthcare+System",
    technologies: ["Ruby on Rails", "MySQL", "SASS", "Stimulus.js"],
    githubLink: "https://github.com/mukeshmahara/healthcare-system",
    liveLink: "https://healthcare-system.mukeshmahara.com.np"
  },
  {
    id: 3,
    title: "Shipping Logistics Dashboard",
    description: "Created an interactive dashboard for shipping logistics that visualizes global shipping routes, container tracking, and delivery estimates. Implemented integration with multiple shipping carriers' APIs and real-time tracking updates.",
    image: "https://via.placeholder.com/640x360?text=Logistics+Dashboard",
    technologies: ["Next.js", "Chart.js", "Material UI", "Node.js"],
    githubLink: "https://github.com/mukeshmahara/shipping-logistics",
    liveLink: "https://logistics.mukeshmahara.com.np"
  },
  {
    id: 4,
    title: "E-commerce Platform",
    description: "Developed a scalable e-commerce solution with features including product catalog management, user authentication, shopping cart functionality, payment processing, and order management. Implemented responsive design for optimal mobile experience.",
    image: "https://via.placeholder.com/640x360?text=E-commerce+Platform",
    technologies: ["Ruby on Rails", "PostgreSQL", "Bootstrap", "jQuery"],
    githubLink: "https://github.com/mukeshmahara/ecommerce",
    liveLink: "https://ecommerce.mukeshmahara.com.np"
  },
  {
    id: 5,
    title: "Room on Rent",
    description: "Developed a scalable e-commerce solution with features including product catalog management, user authentication, shopping cart functionality, payment processing, and order management. Implemented responsive design for optimal mobile experience.",
    image: "https://via.placeholder.com/640x360?text=E-commerce+Platform",
    technologies: ["Ruby on Rails", "PostgreSQL", "Bootstrap", "jQuery"],
    githubLink: "https://github.com/mukeshmahara/ecommerce",
    liveLink: "https://ecommerce.mukeshmahara.com.np"
  },
  {
    id: 6,
    title: "Wether API",
    description: "Developed a scalable e-commerce solution with features including product catalog management, user authentication, shopping cart functionality, payment processing, and order management. Implemented responsive design for optimal mobile experience.",
    image: "https://via.placeholder.com/640x360?text=E-commerce+Platform",
    technologies: ["Ruby on Rails", "PostgreSQL", "Bootstrap", "jQuery"],
    githubLink: "https://github.com/mukeshmahara/ecommerce",
    liveLink: "https://weather.mukeshmahara.com.np"
  },
  {
    id: 7,
    title: "TIC TAC TOE Game",
    description: "Developed a scalable e-commerce solution with features including product catalog management, user authentication, shopping cart functionality, payment processing, and order management. Implemented responsive design for optimal mobile experience.",
    image: "https://via.placeholder.com/640x360?text=E-commerce+Platform",
    technologies: ["Ruby on Rails", "PostgreSQL", "Bootstrap", "jQuery"],
    githubLink: "https://github.com/mukeshmahara/ecommerce",
    liveLink: "https://tictactoe.mukeshmahara.com.np"
  },
  {
    id: 8,
    title: "Driving Practice Test",
    description: "Developed a scalable e-commerce solution with features including product catalog management, user authentication, shopping cart functionality, payment processing, and order management. Implemented responsive design for optimal mobile experience.",
    image: "https://via.placeholder.com/640x360?text=E-commerce+Platform",
    technologies: ["Ruby on Rails", "PostgreSQL", "Bootstrap", "jQuery"],
    githubLink: "https://github.com/mukeshmahara/ecommerce",
    liveLink: "https://dmv.mukeshmahara.com.np"
  },
  {
    id: 9,
    title: "PhysioHub Nepal",
    description: "Developed a scalable healthcare platform for physiotherapy services, including appointment scheduling, patient management, and telehealth features.",
    image: physio,
    technologies: ["Ruby on Rails", "PostgreSQL", "Bootstrap", "jQuery"],
    githubLink: "https://github.com/mukeshmahara/ecommerce",
    liveLink: "https://dev-physio.mukeshmahara.com.np"
  }
];

const Projects = () => {
  return (
    <div className="projects-container">
      <div className="projects-grid">
        {projectsData.map(project => (
          <ProjectCard 
            key={project.id}
            title={project.title}
            description={project.description}
            image={project.image}
            technologies={project.technologies}
            githubLink={project.githubLink}
            liveLink={project.liveLink}
          />
        ))}
      </div>
    </div>
  );
};

export default Projects;