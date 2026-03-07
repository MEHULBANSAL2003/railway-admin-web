import {ApiConstants} from "../constants/ApiConstants.js";
import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";


const train_base_url =  import.meta.env.VITE_API_TRAIN_URL;

export const TrainService = {

  getAllForAdmin: async (params) => {
    const url = `${train_base_url}${ApiConstants.getAllTrainsForAdmin}`;
    return await HttpWrapper.get(url, params, true);
  },

  getAllForDropdown: async (params) => {

    const url = `${train_base_url}${ApiConstants.getAllTrains}`;
    return await HttpWrapper.get(url, {search: params}, true);
  },

  addTrain: async (payload) => {
    const url = `${train_base_url}${ApiConstants.addTrains}`;
    return await HttpWrapper.post(url, payload, true);
  },

  updateTrain: async (trainNumber, payload) => {
    const url = `${train_base_url}${ApiConstants.updateTrainDetails}/${trainNumber}`;
    return await HttpWrapper.post(url, payload, true);
  },

  toggleStatus: async (trainNumber, isActive) => {
    const url = `${train_base_url}${ApiConstants.changeTrainStatus}`;
    return await HttpWrapper.postByIdWithQueryParams(url, trainNumber, { isActive }, true);
  },

  getCascadeInfo: async(trainNumber) => {
    const url = `${train_base_url}${ApiConstants.getTrainCascadeInfo}/${trainNumber}`;
    return await HttpWrapper.get(url, null, true);
  },

  getReturnTrainInfo: async (trainNumber) => {
    const url = `${train_base_url}${ApiConstants.getReturnTrainInfo}/${trainNumber}`;
    return await HttpWrapper.get(url, null, true);
  },

  uploadFromExcel: async (file) => {
    const url = `${train_base_url}${ApiConstants.uploadStationExcel}`;
    return await HttpWrapper.postFormData(url, { file }, true);
  },

  downloadTemplate: async () => {
    const url = `${train_base_url}${ApiConstants.getTemplate}`;
    return await HttpWrapper.get(url, null, true, {
      responseType: "blob",
    });
  }

}
