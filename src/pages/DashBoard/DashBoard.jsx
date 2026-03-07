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
import {BiMoney} from "react-icons/bi";
import {SiSeat} from "react-icons/si";
import {GiCarSeat, GiSeatedMouse} from "react-icons/gi";

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
      title: 'Train Types',
      description: 'Manage train Types',
      icon: Train,
      link: '/train-types',
      color: '#f59e0b'
    },
    {
      id: 5,
      title: 'Coach Types',
      description: 'Manage coach Types',
      icon: GiCarSeat,
      link: '/coach-types',
      color: '#8b5cf6'
    },
    {
      id: 6,
      title: 'Fare rules',
      description: 'Fair rules management',
      icon: BiMoney,
      link: '/fare-rules',
      color: '#06b6d4'
    },
    {
      id: 7,
      title: 'Quota Management',
      description: 'Quota management',
      icon: GiSeatedMouse,
      link: '/quotas',
      color: '#ec4899'
    },
    {
      id: 8,
      title: 'Trains Management',
      description: 'Trains management',
      icon: Train,
      link: '/trains',
      color: '#64748b'
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
