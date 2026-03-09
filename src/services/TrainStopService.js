import { HttpWrapper }  from "../httpWrapper/HttpWrapper.js";

const base_url = import.meta.env.VITE_API_TRAIN_URL;

export const TrainStopService = {

  getAllByTrain: async (trainNumber) => {
    const url = `${base_url}/${trainNumber}/stops`;
    return await HttpWrapper.get(url, null, true);
  },

  addStop: async (trainNumber, payload) => {
    const url = `${base_url}/${trainNumber}/stops/add/new`;
    return await HttpWrapper.post(url, payload, true);
  },

  updateStop: async (trainNumber, stopId, payload) => {
    const url = `${base_url}/${trainNumber}/stops/update/${stopId}`;
    return await HttpWrapper.post(url, payload, true);
  },

  deleteStop: async (trainNumber, stopId) => {
    const url = `${base_url}/${trainNumber}/stops/delete/${stopId}`;
    return await HttpWrapper.post(url, null, true);
  },
  bulkAddStops: async (trainNumber, stops) => {
    // stops: [{ stationCode, stopNumber, kmFromSource, arrivalTime, departureTime, dayNumber }]
    const url = `${base_url}/${trainNumber}/stops/bulk`;
    return await HttpWrapper.post(url, { stops }, true);
  },

  getCopyPreview: async (sourceTrainNumber, targetTrainNumber) => {
    const url = `${base_url}/${sourceTrainNumber}/stops/copy-preview?targetTrain=${targetTrainNumber}`;
    return await HttpWrapper.get(url, null, true);
  },
};
