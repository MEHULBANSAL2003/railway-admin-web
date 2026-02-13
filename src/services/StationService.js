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
}
