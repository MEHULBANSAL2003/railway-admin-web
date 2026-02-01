import {ApiConstants} from "../constants/ApiConstants.js";
import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";


const auth_base_url =  import.meta.env.VITE_API_AUTH_URL;
const base_url = import.meta.env.VITE_API_URL;

export const AuthService = {

  loginByEmail : async(payload) => {
    const url = `${auth_base_url}${ApiConstants.adminEmailLogin}`;
    return await HttpWrapper.post(url, payload);
  },

  logoutCurrentDevice : async(payload) => {
    const url = `${base_url}${ApiConstants.logoutCurrentDevice}`;
    return await HttpWrapper.post(url, payload, true);
  }



}
