// src/config/routes.config.js


export const searchableRoutes = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    description: 'Overview and statistics',
    keywords: ['home', 'overview', 'stats', 'analytics', 'main'],
    icon: '📊',
    category: 'Main'
  },
  {
    id: 'create-admin',
    name: 'Create Admin',
    path: '/admin/create',
    description: 'Add new admin users',
    keywords: ['add admin', 'new admin', 'register admin', 'admin user'],
    icon: '👤',
    category: 'Admin Management'
  },
  {
    id: 'manage-trains',
    name: 'Manage Trains',
    path: '/admin/trains',
    description: 'Add, edit or remove train schedules',
    keywords: ['trains', 'schedule', 'railway', 'train list'],
    icon: '🚂',
    category: 'Train Management'
  },
  {
    id: 'bookings',
    name: 'View Bookings',
    path: '/admin/bookings',
    description: 'Monitor all ticket bookings',
    keywords: ['bookings', 'tickets', 'reservations', 'orders'],
    icon: '🎫',
    category: 'Bookings'
  },
  {
    id: 'users',
    name: 'User Management',
    path: '/admin/users',
    description: 'Manage registered users',
    keywords: ['users', 'customers', 'passengers', 'user list'],
    icon: '👥',
    category: 'User Management'
  },
  {
    id: 'routes',
    name: 'Route Management',
    path: '/admin/routes',
    description: 'Configure train routes and stations',
    keywords: ['routes', 'stations', 'destinations', 'paths'],
    icon: '🗺️',
    category: 'Route Management'
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    path: '/admin/reports',
    description: 'View detailed reports and statistics',
    keywords: ['reports', 'analytics', 'statistics', 'data', 'insights'],
    icon: '📈',
    category: 'Reports'
  },
  {
    id: 'pricing',
    name: 'Pricing Management',
    path: '/admin/pricing',
    description: 'Set and update ticket prices',
    keywords: ['pricing', 'fares', 'rates', 'costs', 'ticket price'],
    icon: '💰',
    category: 'Pricing'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    path: '/admin/notifications',
    description: 'Send alerts to users',
    keywords: ['notifications', 'alerts', 'messages', 'announcements'],
    icon: '🔔',
    category: 'Communication'
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '/admin/settings',
    description: 'System configuration',
    keywords: ['settings', 'configuration', 'preferences', 'setup'],
    icon: '⚙️',
    category: 'System'
  }
];

/**
 * Search function to filter routes based on query
 * @param {string} query - Search query
 * @returns {Array} - Filtered routes
 */
export const searchRoutes = (query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();

  return searchableRoutes.filter(route => {
    // Search in name
    if (route.name.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in description
    if (route.description.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in keywords
    if (route.keywords.some(keyword => keyword.includes(searchTerm))) {
      return true;
    }

    // Search in category
    if (route.category.toLowerCase().includes(searchTerm)) {
      return true;
    }

    return false;
  });
};

/**
 * Get route by ID
 * @param {string} id - Route ID
 * @returns {Object|null} - Route object or null
 */
export const getRouteById = (id) => {
  return searchableRoutes.find(route => route.id === id) || null;
};

/**
 * Get routes by category
 * @param {string} category - Category name
 * @returns {Array} - Routes in the category
 */
export const getRoutesByCategory = (category) => {
  return searchableRoutes.filter(route => route.category === category);
};

/**
 * Get all unique categories
 * @returns {Array} - List of categories
 */
export const getAllCategories = () => {
  return [...new Set(searchableRoutes.map(route => route.category))];
};
