import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";
import {ApiConstants} from "../constants/ApiConstants.js";

const train_type_base_url =  import.meta.env.VITE_API_TRAIN_TYPE_URL;

export const TrainTypeService = {

  getAllForAdmin: (params) => {
    const url = `${train_type_base_url}${ApiConstants.getAllTrainTypesForAdmin}`;
    return HttpWrapper.get(url, params, true);
  },

  getAllForDropdown: (params) => {

    const url = `${train_type_base_url}${ApiConstants.getAllTrainTypes}`;
    return HttpWrapper.get(url, {search: params}, true);
  },

  addTrainType: (payload) => {
    const url = `${train_type_base_url}${ApiConstants.addTrainTypes}`;
    return HttpWrapper.post(url, payload, true);
  },

  updateTrainType: (typeCode, payload) => {
    const url = `${train_type_base_url}${ApiConstants.updateTrainTypes}/${typeCode}`;
    return HttpWrapper.post(url, payload, true);
  },

  toggleStatus: (typeCode, payload) => {
    const url = `${train_type_base_url}${ApiConstants.changeTrainTypeStatus}/${typeCode}`;
    return HttpWrapper.post(url, payload, true);
  },

  getCascadeInfo: (typeCode) => {
    const url = `${train_type_base_url}/cascade-info/${typeCode}`;
    return HttpWrapper.get(url, null, true);
  },

  getAllowedCoaches: (typeCode) => {
    const url = `${train_type_base_url}/allowed-coaches/${typeCode}`;
    return HttpWrapper.get(url, null, true);
  },

  setAllowedCoaches: (typeCode, coachTypeCodes) => {
    const url = `${train_type_base_url}/allowed-coaches/${typeCode}`;
    return HttpWrapper.post(url, { coachTypeCodes }, true);
  }
};

