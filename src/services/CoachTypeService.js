import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";
import {ApiConstants} from "../constants/ApiConstants.js";

const coach_type_base_url =  import.meta.env.VITE_API_COACH_TYPE_URL;


export const CoachTypeService = {

  getAllForAdmin: (params) => {
    const url = `${coach_type_base_url}${ApiConstants.getAllCoachTypesForAdmin}`;
    return HttpWrapper.get(url, params, true);
  },

  getAllForDropdown: () => {
    const url = `${coach_type_base_url}${ApiConstants.getAllCoachTypes}`;
    return HttpWrapper.get(url, null, true);
  },

  addTrainType: (payload) => {
    const url = `${coach_type_base_url}${ApiConstants.addCoachTypes}`;
    return HttpWrapper.post(url, payload, true);
  },

  updateTrainType: (typeCode, payload) => {
    const url = `${coach_type_base_url}${ApiConstants.updateCoachTypes}/${typeCode}`;
    return HttpWrapper.post(url, payload, true);
  },

  toggleStatus: (typeCode, isActive) => {
    const url = `${coach_type_base_url}${ApiConstants.changeCoachTypeStatus}`;
    return HttpWrapper.postByIdWithQueryParams(url, typeCode, { isActive }, true);
  },
};
