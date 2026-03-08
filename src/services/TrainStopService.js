import { ApiConstants } from "../constants/ApiConstants.js";
import { HttpWrapper }  from "../httpWrapper/HttpWrapper.js";

const base_url = import.meta.env.VITE_API_TRAIN_URL;

export const TrainStopService = {

  getAllByTrain: async (trainNumber) => {
    const url = `${base_url}/${trainNumber}${ApiConstants.getTrainStops}`;
    return await HttpWrapper.get(url, null, true);
  },

  addStop: async (trainNumber, payload) => {
    const url = `${base_url}/${trainNumber}${ApiConstants.addTrainStop}`;
    return await HttpWrapper.post(url, payload, true);
  },

  updateStop: async (trainNumber, stopId, payload) => {
    const url = `${base_url}/${trainNumber}${ApiConstants.updateTrainStop}/${stopId}`;
    return await HttpWrapper.patch(url, payload, true);
  },

  deleteStop: async (trainNumber, stopId) => {
    const url = `${base_url}/${trainNumber}${ApiConstants.getTrainStops}/${stopId}`;
    return await HttpWrapper.delete(url, true);
  },
};
