import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";
import {ApiConstants} from "../constants/ApiConstants.js";

const base_url = import.meta.env.VITE_API_TRAIN_URL;

export const JourneyService = {

  getAllJourneysOfTrain: async (trainNumber) => {
    const url = `${base_url}/${trainNumber}/journeys`;
    return await HttpWrapper.get(url, null, true);
  },
  generateJourneyOfTrain: async (trainNumber) => {
    const url = `${base_url}/${trainNumber}/journeys/generate`;
    return await HttpWrapper.post(url, null, true);
  },
  bulkGenerateJourneyOfTrain: async (trainNumber) => {
    const url = `${base_url}/${trainNumber}/journeys/bulk-generate`;
    return await HttpWrapper.post(url, null, true);
  },

  addJourneysOfTrain: async (trainNumber,journeyDate) => {
    const url = `${base_url}/${trainNumber}/journeys/add`;
    return await HttpWrapper.post(url, {journeyDate}, true);
  },
  cancelJourney: async (trainNumber,journeyId,reason) => {
    const url = `${base_url}/${trainNumber}/journeys/${journeyId}/cancel`;
    return await HttpWrapper.post(url, {reason}, true);
  }

}
