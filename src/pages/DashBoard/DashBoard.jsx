import { useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, User } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: 'Admins',
      description: 'Manage admin users, roles, and access',
      icon: Users,
      link: '/admins',
      color: '#667eea'
    },
    {
      id: 2,
      title: 'Dashboard',
      description: 'Overview and system statistics',
      icon: LayoutDashboard,
      link: '/dashboard',
      color: '#10b981'
    },
    {
      id: 3,
      title: 'Profile',
      description: 'View your profile information',
      icon: User,
      link: '/profile',
      color: '#f59e0b'
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Railway Management System</p>
      </div>

      <div className="features-grid">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="feature-card"
              onClick={() => navigate(feature.link)}
            >
              <div className="feature-icon" style={{ background: feature.color }}>
                <Icon size={22} color="#ffffff" strokeWidth={2} />
              </div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
