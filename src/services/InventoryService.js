import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";


const base_url = import.meta.env.VITE_API_TRAIN_URL;

export const InventoryService = {
  getJourneyInventory: async (trainNumber, journeyId) => {
    const url = `${base_url}/${trainNumber}/journeys/${journeyId}/inventory`;
    return await HttpWrapper.get(url, null, true);
  }
};
