import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ closeMenu }) => {
  const navigation = [
    {
      label: "Intro",
      path: "/",
      end: true,
    },
    {
      label: "Projects",
      path: "/projects",
    },
    {
      label: "Work Experience",
      path: "/experience",
    },
    {
      label: "Education",
      path: "/education",
    },
    {
      label: "Skills",
      path: "/skills",
    },
    {
      label: "Achievements",
      path: "/achievements",
    },
    {
      label: "Prize Checker",
      path: "/coupon-checker",
    },
    {
      label: "AI Assistant",
      path: "/voice-assistant",
    },
    {
      label: "Prize Draws",
      path: "/draws",
    },
    {
      label: "Chat",
      path: "/chat",
    },
  ];

  const handleNavClick = () => {
    if (closeMenu) {
      closeMenu();
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
        <div role="menu">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              role="menuitem"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-button ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <p>&copy; {new Date().getFullYear()} Mukesh Mahara</p>
      </div>
    </div>
  );
};

export default Sidebar;
