import { HttpWrapper } from "../httpWrapper/HttpWrapper.js";

const base_url = import.meta.env.VITE_API_TRAIN_URL;

export const TrainScheduleService = {

  // Single call — running, upcoming[], past[], deactivated[]
  getSummary: async (trainNumber) => {
    const url = `${base_url}/${trainNumber}/schedule/summary`;
    return await HttpWrapper.get(url, null, true);
  },

  // Create new schedule
  // payload: { runDays: ['MON','WED','FRI'], startDate: '2026-07-05' }
  createSchedule: async (trainNumber, payload) => {
    const url = `${base_url}/${trainNumber}/schedule/add`;
    return await HttpWrapper.post(url, payload, true);
  },

  // Toggle isActive (deactivate/reactivate)
  toggleSchedule: async (trainNumber, scheduleId, payload) => {
    const url = `${base_url}/${trainNumber}/schedule/${scheduleId}/change/status`;
    return await HttpWrapper.post(url, payload, true);
  },
};
