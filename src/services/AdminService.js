import {ApiConstants} from "../constants/ApiConstants.js";
import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";

const base_url = import.meta.env.VITE_API_URL;

export const AdminService = {


  createNewAdmin : async(payload) => {
    const url = `${base_url}${ApiConstants.createNewAdmin}`;
    return await HttpWrapper.post(url, payload);
  },

  getAllAdminList: async(payload) => {
    const url = `${base_url}${ApiConstants.getAllAdminList}`;
    return await HttpWrapper.get(url, payload, true);
  },

  updateAdminActiveStatus : async(id,payload) => {
    const url = `${base_url}${ApiConstants.updateAdminActiveStatus}`;
    return await HttpWrapper.patchByIdWithQueryParams(url, id,payload, true);
  }
}
