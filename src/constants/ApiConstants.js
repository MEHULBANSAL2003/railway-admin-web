export const ApiConstants = {

  //admin
  adminEmailLogin: '/admin/login/by/email',
  refreshAccessToken: '/refresh/access/token',
  logoutCurrentDevice: '/admin/logout',
  createNewAdmin: '/new/admin/create',
  getAllAdminList: '/admin/list',
  updateAdminActiveStatus: '/admin/update/status',
  updateAdminRole: '/admin/role/update',



  //stations
  createNewStation: '/admin/add/new/station',
  getAllStations: '/get/all/list',
  searchStations: '/search/by/name',
  uploadStationExcel: '/upload/excel',
  updateStationStatus: '/set/active/inactive',
  updateStationDetails: '/update/details',
  deleteStation: '/delete',


  //cities
  getAllCities: '/get/all',
  getAllCitiesByState: '/by/state/name',
  addNewCity: '/add/new',
  addCitiesByExcel: '/upload/excel',

  //states
  getAllStates: '/get/all/list',
  addStatesByExcel: '/upload/excel',

  //zones
  getAllZones: '/get/all',
}
