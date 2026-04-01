import ApiConstants from '../constants/ApiConstants.js';
import { HttpWrapper } from '../httpWrapper/HttpWrapper.js';

export const UserService = {
  getById: async (userId) => {
    return await HttpWrapper.get(ApiConstants.USER.BY_ID(userId), null, true);
  },

  getStatusHistory: async (userId, params) => {
    return await HttpWrapper.get(ApiConstants.USER.STATUS_HISTORY(userId), params, true);
  },
};
