import { useState } from 'react';
import './Dashboard.css';
import {useNavigate} from "react-router-dom";

const Dashboard = () => {


  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: 'Create Admin',
      description: 'Add new admin users to the system',
      icon: '👤',
      link: '/admin/create',
      color: '#4CAF50'
    },
    {
      id: 2,
      title: 'Station Management',
      description: 'Add, edit or remove railway stations',
      icon: '🚉',
      link: '/admin/stations',
      color: '#05876f'
    },

  ];


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Train Booking Management System</p>
      </div>

      <div className="features-section">
        <h2>Quick Actions</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
              style={{ borderLeftColor: feature.color }}
            >
              <div className="feature-icon" style={{ backgroundColor: feature.color + '20' }}>
                <span style={{ fontSize: '2rem' }}>{feature.icon}</span>
              </div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <button
                  className="feature-button"
                  style={{ backgroundColor: feature.color }}
                  onClick={() => navigate(feature.link)}
                >
                  Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
