  import {ApiConstants} from "../constants/ApiConstants.js";
  import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";


  const station_base_url =  import.meta.env.VITE_API_STATION_URL;

  export const StationService = {

    createNewStation : async(payload) => {
      const url = `${station_base_url}${ApiConstants.createNewStation}`;
      return await HttpWrapper.post(url, payload);
    },

    getAllStations : async(payload) => {
      const url = `${station_base_url}${ApiConstants.getAllStations}`;
      return await HttpWrapper.get(url, payload);
    },

    searchStations : async(payload) => {
      const url = `${station_base_url}${ApiConstants.searchStations}`;
      return await HttpWrapper.get(url, payload);
    },

    uploadStationExcel: async (file) => {
      const url = `${station_base_url}${ApiConstants.uploadStationExcel}`;
      return await HttpWrapper.postFormData(url, { file }, true);
    },

    updateStationStatus: async (stationCode, activeStatus) => {
      const url = `${station_base_url}${ApiConstants.updateStationStatus}`;
      return await HttpWrapper.postByIdWithQueryParams(url, stationCode, { activeStatus }, true);
    },

    updateStationDetails: async (stationCode, payload) => {
      const url = `${station_base_url}${ApiConstants.updateStationDetails}/${stationCode}`;
      return await HttpWrapper.post(url, payload, true);
    },
    deleteStation : async (stationCode) => {
      const url = `${station_base_url}${ApiConstants.deleteStation}`;
      return await HttpWrapper.postByIdWithQueryParams(url, stationCode,  null, true);
    },


  }
