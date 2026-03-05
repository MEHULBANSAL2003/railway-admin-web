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
    id: 'admin-management',
    name: 'Admin Management',
    path: '/admins',
    description: 'View, search, filter, create, update and delete admin users',
    keywords: [
      'admin',
      'admins',
      'admin list',
      'list admin',
      'manage admin',
      'create admin',
      'add admin',
      'edit admin',
      'update admin',
      'delete admin',
      'remove admin',
      'admin management',
      'admin users',
      'super admin'
    ],
    icon: '👤',
    category: 'Admin Management'
  },
  {
    id: 'states-city-management',
    name: 'States and city Management',
    path: '/states-cities',
    description: 'View, search, filter, create states and cities',
    keywords: [
      'states',
      'cities'
    ],
    icon: '👤',
    category: 'States & Cities'
  },
  {
    id: 'station-management',
    name: 'Station Management',
    path: '/stations',
    description: 'Add/fetch/edit/remove railway stations',
    keywords: ['add station', 'get stations', 'update stations', 'remove stations', 'stations'],
    icon: '👤',
    category: 'Station Management'
  },
  {
    id: 'train-type-management',
    name: 'Train Type Management',
    path: '/train-types',
    description: 'Manage train types',
    keywords: ['train types', 'train type', 'train type management'],
    icon: '👤',
    category: 'Train Type Management'
  },
  {
    id: 'coach-type-management',
    name: 'Coach Type Management',
    path: '/coach-types',
    description: 'Manage coach types',
    keywords: ['coach types', 'coach type', 'coach type management'],
    icon: '👤',
    category: 'Train Type Management'
  },
  {
    id: 'fare-rule-management',
    name: 'Fare Rule Management',
    path: '/fare-rules',
    description: 'Manage fare rules',
    keywords: ['fare rules', 'fare', 'price'],
    icon: '👤',
    category: 'Fare Management'
  },

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
