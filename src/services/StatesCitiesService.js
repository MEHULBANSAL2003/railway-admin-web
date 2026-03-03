import {ApiConstants} from "../constants/ApiConstants.js";
import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";


const cities_base_url =  import.meta.env.VITE_API_CITIES_URL;
const states_base_url =  import.meta.env.VITE_API_STATES_URL;

export const StatesCitiesService = {

  getAllStates : async(payload) => {
    const url = `${states_base_url}${ApiConstants.getAllStates}`;
    return await HttpWrapper.get(url, payload);
  },

  getAllCities : async(payload) => {
    const url = `${cities_base_url}${ApiConstants.getAllCities}`;
    return await HttpWrapper.get(url, payload);
  },

  getAllCitiesByState : async(payload) => {
    const url = `${cities_base_url}${ApiConstants.getAllCitiesByState}`;
    return await HttpWrapper.get(url, payload);
  },

  addNewCity : async(payload) => {
    const url = `${cities_base_url}${ApiConstants.addNewCity}`;
    return await HttpWrapper.post(url, payload);
  },

  addCitiesByExcel: async (file) => {
    const url = `${cities_base_url}${ApiConstants.addCitiesByExcel}`;
    return await HttpWrapper.postFormData(url, { file }, true);
  },

  addStatesByExcel: async (file) => {
    const url = `${states_base_url}${ApiConstants.addStatesByExcel}`;
    return await HttpWrapper.postFormData(url, { file }, true);
  },


}
