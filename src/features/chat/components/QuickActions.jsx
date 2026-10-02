import React from "react";

const QuickActions = () => {
  return (
    <div className="quick-actions project-card">
      <h3>⚡ Quick Actions</h3>

      <div className="action-buttons">
        <button className="nav-button btn-info">
          📞 Schedule Call
        </button>

        <button className="nav-button btn-warning">
          📋 Share Screen
        </button>

        <button className="nav-button btn-success">
          🔗 Copy Meeting Link
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
