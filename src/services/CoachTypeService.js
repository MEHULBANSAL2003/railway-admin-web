import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";
import {ApiConstants} from "../constants/ApiConstants.js";

const coach_type_base_url =  import.meta.env.VITE_API_COACH_TYPE_URL;


export const CoachTypeService = {

  getAllForAdmin: async (params) => {
    const url = `${coach_type_base_url}${ApiConstants.getAllCoachTypesForAdmin}`;
    return await HttpWrapper.get(url, params, true);
  },

  getAllForDropdown: async (params) => {
    const url = `${coach_type_base_url}${ApiConstants.getAllCoachTypes}`;
    return await HttpWrapper.get(url, {search: params}, true);
  },

  addCoachType: async (payload) => {
    const url = `${coach_type_base_url}${ApiConstants.addCoachTypes}`;
    return await HttpWrapper.post(url, payload, true);
  },

  updateCoachType: async (typeCode, payload) => {
    const url = `${coach_type_base_url}${ApiConstants.updateCoachTypes}/${typeCode}`;
    return await HttpWrapper.post(url, payload, true);
  },

  toggleStatus: async (typeCode, payload) => {
    const url = `${coach_type_base_url}${ApiConstants.changeCoachTypeStatus}/${typeCode}`;
    return await HttpWrapper.post(url, payload, true);
  },

  getCascadeInfo: async (typeCode) => {
    const url = `${coach_type_base_url}/cascade-info/${typeCode}`;
    return await HttpWrapper.get(url, null, true);
  },
};
