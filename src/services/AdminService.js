import ApiConstants from '../constants/ApiConstants.js';
import { HttpWrapper } from '../httpWrapper/HttpWrapper.js';

export const AdminService = {
  getMyProfile: async () => {
    return await HttpWrapper.get(ApiConstants.ADMIN.ME, null, true);
  },

  getById: async (id) => {
    return await HttpWrapper.get(ApiConstants.ADMIN.BY_ID(id), null, true);
  },

  list: async (params) => {
    return await HttpWrapper.get(ApiConstants.ADMIN.BASE, params, true);
  },

  create: async (data) => {
    return await HttpWrapper.post(ApiConstants.ADMIN.BASE, data, true);
  },

  toggleStatus: async (id) => {
    return await HttpWrapper.post(ApiConstants.ADMIN.TOGGLE_STATUS(id), null, true);
  },

  changeRole: async (id) => {
    return await HttpWrapper.post(ApiConstants.ADMIN.CHANGE_ROLE(id), null, true);
  },

  getMySession: async () => {
    return await HttpWrapper.get(ApiConstants.ADMIN.MY_SESSION, null, true);
  },
};
