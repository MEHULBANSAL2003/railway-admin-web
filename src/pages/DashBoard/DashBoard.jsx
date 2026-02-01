import { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats] = useState({
    totalBookings: 1245,
    activeTrains: 45,
    totalRevenue: 2456789,
    pendingRequests: 23,
    registeredUsers: 5678,
    todayBookings: 87,
    cancelledBookings: 12,
    occupancyRate: 78
  });

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
      title: 'Manage Trains',
      description: 'Add, edit or remove train schedules',
      icon: '🚂',
      link: '/admin/trains',
      color: '#2196F3'
    },
    {
      id: 3,
      title: 'View Bookings',
      description: 'Monitor all ticket bookings',
      icon: '🎫',
      link: '/admin/bookings',
      color: '#FF9800'
    },
    {
      id: 4,
      title: 'User Management',
      description: 'Manage registered users',
      icon: '👥',
      link: '/admin/users',
      color: '#9C27B0'
    },
    {
      id: 5,
      title: 'Route Management',
      description: 'Configure train routes and stations',
      icon: '🗺️',
      link: '/admin/routes',
      color: '#F44336'
    },
    {
      id: 6,
      title: 'Reports & Analytics',
      description: 'View detailed reports and statistics',
      icon: '📊',
      link: '/admin/reports',
      color: '#00BCD4'
    },
    {
      id: 7,
      title: 'Pricing Management',
      description: 'Set and update ticket prices',
      icon: '💰',
      link: '/admin/pricing',
      color: '#FF5722'
    },
    {
      id: 8,
      title: 'Notifications',
      description: 'Send alerts to users',
      icon: '🔔',
      link: '/admin/notifications',
      color: '#795548'
    }
  ];

  const recentActivities = [
    { id: 1, activity: 'New booking #1245 created', time: '5 mins ago' },
    { id: 2, activity: 'Train T-101 schedule updated', time: '15 mins ago' },
    { id: 3, activity: 'User John Doe registered', time: '1 hour ago' },
    { id: 4, activity: 'Booking #1230 cancelled', time: '2 hours ago' },
    { id: 5, activity: 'New route Mumbai-Delhi added', time: '3 hours ago' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Train Booking Management System</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-details">
            <h3>{stats.totalBookings.toLocaleString()}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚆</div>
          <div className="stat-details">
            <h3>{stats.activeTrains}</h3>
            <p>Active Trains</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-details">
            <h3>₹{(stats.totalRevenue / 100000).toFixed(1)}L</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-details">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
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
                  onClick={() => window.location.href = feature.link}
                >
                  Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Additional Stats */}
      <div className="dashboard-bottom">
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p>{item.activity}</p>
                  <span className="activity-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="additional-stats">
          <h2>Performance Metrics</h2>
          <div className="metric-item">
            <span>Today's Bookings</span>
            <strong>{stats.todayBookings}</strong>
          </div>
          <div className="metric-item">
            <span>Registered Users</span>
            <strong>{stats.registeredUsers.toLocaleString()}</strong>
          </div>
          <div className="metric-item">
            <span>Cancelled Today</span>
            <strong>{stats.cancelledBookings}</strong>
          </div>
          <div className="metric-item">
            <span>Avg. Occupancy</span>
            <strong>{stats.occupancyRate}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
