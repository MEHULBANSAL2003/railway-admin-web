import ApiConstants from '../constants/ApiConstants.js';
import { HttpWrapper } from '../httpWrapper/HttpWrapper.js';

export const AuthService = {
  loginWithGoogle: async (idToken) => {
    return await HttpWrapper.post(ApiConstants.AUTH.LOGIN_GOOGLE, { idToken });
  },

  refreshToken: async (refreshToken) => {
    return await HttpWrapper.post(ApiConstants.AUTH.REFRESH, { refreshToken });
  },

  logout: async (refreshToken) => {
    return await HttpWrapper.post(ApiConstants.ADMIN.LOGOUT, { refreshToken }, true);
  },
};
