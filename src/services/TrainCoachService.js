import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";
import {ApiConstants} from "../constants/ApiConstants.js";

const train_coach_base_url =  import.meta.env.VITE_API_TRAIN_COACHES_URL;

export const TrainCoachService = {

  getAllByTrain: (trainNumber) => {
    const url = `${train_coach_base_url}${ApiConstants.getAllCoachesByTrain}/${trainNumber}`;
    return HttpWrapper.get(url, null, true);
  },

  addCoach: (trainNumber, payload) => {
    const url = `${train_coach_base_url}${ApiConstants.addNewCoachesByTrain}/${trainNumber}`;
    return HttpWrapper.post(url, payload, true);
  },

  updateCoach: (trainNumber, coachId, payload)  => {
    const url = `${train_coach_base_url}${ApiConstants.updateCoachesByTrain}/${trainNumber}/${coachId}`;
    return HttpWrapper.post(url, payload, true);
  },

  toggleStatus: (trainNumber, coachId, isActive)  => {
    const url = `${train_coach_base_url}${ApiConstants.changeTrainCoachStatus}/${trainNumber}/${coachId}`;
    return HttpWrapper.post(url, { isActive }, true);
  },


};
