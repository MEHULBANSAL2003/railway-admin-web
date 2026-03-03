import { useNavigate } from "react-router-dom";
import {
  Users,
  MapPin,
  Train,
  Route,
  Package,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: 'Admins',
      description: 'Manage admin users',
      icon: Users,
      link: '/admins',
      color: '#667eea'
    },
    {
      id: 2,
      title: 'States & Cities',
      description: 'Manage States & Cities',
      icon: MapPin,
      link: '/states-cities',
      color: '#f1a6a6'
    },
    {
      id: 3,
      title: 'Stations',
      description: 'Manage railway stations',
      icon: MapPin,
      link: '/stations',
      color: '#10b981'
    },
    {
      id: 4,
      title: 'Trains',
      description: 'Manage train schedules',
      icon: Train,
      link: '/admin/trains',
      color: '#f59e0b'
    },
    {
      id: 5,
      title: 'Routes',
      description: 'Configure train routes',
      icon: Route,
      link: '/admin/routes',
      color: '#8b5cf6'
    },
    {
      id: 6,
      title: 'Bookings',
      description: 'View all bookings',
      icon: FileText,
      link: '/admin/bookings',
      color: '#06b6d4'
    },
    {
      id: 7,
      title: 'Analytics',
      description: 'View reports & stats',
      icon: BarChart3,
      link: '/admin/analytics',
      color: '#ec4899'
    },
    {
      id: 8,
      title: 'Zones',
      description: 'Manage railway zones',
      icon: Package,
      link: '/admin/zones',
      color: '#14b8a6'
    },
    {
      id: 9,
      title: 'Settings',
      description: 'System configuration',
      icon: Settings,
      link: '/admin/settings',
      color: '#64748b'
    }
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
