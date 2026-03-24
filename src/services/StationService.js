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

    getAllForDropdown: async (payload) => {
      const url = `${station_base_url}${ApiConstants.getAllStationsDropdown}`;
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

    updateStationStatus: async (stationCode, payload) => {
      const url = `${station_base_url}${ApiConstants.updateStationStatus}/${stationCode}`;
      return await HttpWrapper.post(url, payload, true);
    },

    updateStationDetails: async (stationCode, payload) => {
      const url = `${station_base_url}${ApiConstants.updateStationDetails}/${stationCode}`;
      return await HttpWrapper.post(url, payload, true);
    },
    deleteStation : async (stationCode, payload) => {
      const url = `${station_base_url}${ApiConstants.deleteStation}/${stationCode}`;
      return await HttpWrapper.post(url, payload, true);
    },

    getAllPermanentlyDeletedStations : async(payload) => {
      const url = `${station_base_url}${ApiConstants.getAllPermanentlyDeletedStations}`;
      return await HttpWrapper.get(url, payload, true);
    },

    restoreDeletedStation : async (stationCode, payload) => {
      const url = `${station_base_url}${ApiConstants.restoreDeletedStation}/${stationCode}`;
      return await HttpWrapper.post(url, payload, true);
    }


  }
