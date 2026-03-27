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
    description: 'View, search, filter, create, and manage admin users',
    keywords: [
      'admin', 'admins', 'admin list', 'manage admin',
      'create admin', 'add admin', 'edit admin', 'admin management',
      'admin users', 'super admin'
    ],
    icon: '👤',
    category: 'Management'
  },
  {
    id: 'profile',
    name: 'Profile',
    path: '/profile',
    description: 'View your profile information',
    keywords: ['profile', 'my profile', 'account', 'me'],
    icon: '👤',
    category: 'Settings'
  },
];

export const searchRoutes = (query) => {
  if (!query || query.trim().length === 0) return [];

  const searchTerm = query.toLowerCase().trim();

  return searchableRoutes.filter(route => {
    if (route.name.toLowerCase().includes(searchTerm)) return true;
    if (route.description.toLowerCase().includes(searchTerm)) return true;
    if (route.keywords.some(keyword => keyword.includes(searchTerm))) return true;
    if (route.category.toLowerCase().includes(searchTerm)) return true;
    return false;
  });
};

export const getRouteById = (id) => {
  return searchableRoutes.find(route => route.id === id) || null;
};

export const getRoutesByCategory = (category) => {
  return searchableRoutes.filter(route => route.category === category);
};

export const getAllCategories = () => {
  return [...new Set(searchableRoutes.map(route => route.category))];
};
