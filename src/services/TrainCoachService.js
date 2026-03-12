import { HttpWrapper }  from "../httpWrapper/HttpWrapper.js";
import { ApiConstants } from "../constants/ApiConstants.js";

const train_coach_base_url = import.meta.env.VITE_API_TRAIN_COACHES_URL;

export const TrainCoachService = {

  getAllByTrain: (trainNumber) => {
    const url = `${train_coach_base_url}${ApiConstants.getAllCoachesByTrain}/${trainNumber}`;
    return HttpWrapper.get(url, null, true);
  },

  addCoach: (trainNumber, payload) => {
    const url = `${train_coach_base_url}${ApiConstants.addNewCoachesByTrain}/${trainNumber}`;
    return HttpWrapper.post(url, payload, true);
  },

  getAvailableTypes: (trainNumber) => {
    const url = `${train_coach_base_url}/available-types/${trainNumber}`;
    return HttpWrapper.get(url, null, true);
  },

  copyCoaches: (sourceTrainNumber, targetTrainNumber) => {
    const url = `${train_coach_base_url}/${sourceTrainNumber}/coaches/copy`;
    return HttpWrapper.post(url, { targetTrainNumber }, true);
  },

  changeConfig: (trainNumber, coachId, payload) => {
    const url = `${train_coach_base_url}/${trainNumber}/${coachId}/change-config`;
    return HttpWrapper.post(url, payload, true);
  },

  deactivateCoach: (trainNumber, coachId, payload) => {
    const url = `${train_coach_base_url}/${trainNumber}/${coachId}/deactivate`;
    return HttpWrapper.post(url, payload, true);
  },

  reactivateCoach: (trainNumber, coachId, payload) => {
    const url = `${train_coach_base_url}/${trainNumber}/${coachId}/reactivate`;
    return HttpWrapper.post(url, payload, true);
  },

  getCoachHistory: (trainNumber, coachTypeCode) => {
    const url = `${train_coach_base_url}/${trainNumber}/${coachTypeCode}/history`;
    return HttpWrapper.get(url, null, true);
  },

  getAllByTrainIncludingInactive: (trainNumber) => {
    const url = `${train_coach_base_url}/${trainNumber}/coaches/all`;
    return HttpWrapper.get(url, null, true);
  },
};
