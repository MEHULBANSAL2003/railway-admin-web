import {ApiConstants} from "../constants/ApiConstants.js";
import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";

const zone_base_url =  import.meta.env.VITE_API_ZONE_URL;

export const ZoneService = {

  getAllZones : async(payload) => {
    const url = `${zone_base_url}${ApiConstants.getAllZones}`;
    return await HttpWrapper.get(url, payload);
  },

};
