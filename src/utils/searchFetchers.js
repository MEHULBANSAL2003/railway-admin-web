// searchFetchers.js
import { StatesCitiesService } from '../services/StatesCitiesService.js';
import { ZoneService }         from '../services/ZoneService.js';
import { CoachTypeService }    from '../services/CoachTypeService.js';
import { TrainTypeService }    from '../services/TrainTypeService.js';
import { StationService }      from '../services/StationService.js';
import { TrainService }        from '../services/TrainService.js';

export const fetchStates = async (searchTerm) => {
  const res = await StatesCitiesService.getAllStates({ searchTerm });
  return (res.data.data || []).map(s => ({
    value: String(s.id),
    label: s.name,
    meta:  s.code,
    raw:   s,
  }));
};

export const fetchCities = (stateName) => async (searchTerm) => {
  if (!stateName) return [];
  const res = await StatesCitiesService.getAllCitiesByState({
    stateName, searchTerm, page: 0, size: 30,
  });
  const d = res.data.data ?? res.data;
  return (d.content || []).map(c => ({
    value: String(c.id),
    label: c.name,
    raw:   c,
  }));
};

export const fetchZones = async (searchTerm) => {
  const res = await ZoneService.getAllZones({ searchTerm });
  return (res.data.data || []).map(z => ({
    value: String(z.zoneId ?? z.id),
    label: z.zoneName ?? z.name,
    meta:  z.zoneCode ?? z.code,
    raw:   z,
  }));
};

export const fetchTrainTypes = async (searchTerm) => {
  const res = await TrainTypeService.getAllForDropdown(searchTerm);
  return (res.data.data || []).map(t => ({
    value: t.typeCode,
    label: t.typeName,
    meta:  t.typeCode,
    raw:   t,
  }));
};

export const fetchCoachTypes = async (searchTerm) => {
  const res = await CoachTypeService.getAllForDropdown(searchTerm);
  return (res.data.data || []).map(c => ({
    value: c.typeCode,
    label: c.typeName,
    meta:  c.typeCode,
    raw:   c,
  }));
};

export const fetchStations = async (searchTerm) => {
  const payload = searchTerm ? { searchTerm } : {};
  const res = await StationService.getAllForDropdown(payload);
  return (res.data.data || []).map(s => ({
    value: s.stationCode,
    label: `${s.stationCode} — ${s.stationName}`,
    meta:  s.stationType,
    raw:   s,
  }));
};

export const fetchTrains = async (searchTerm) => {
  const res = await TrainService.getAllForDropdown(searchTerm);
  return (res.data.data || []).map(t => ({
    value: t.trainNumber,
    label: `${t.trainNumber} — ${t.trainName}`,
    meta:  t.trainNumber,
    raw:   t,
  }));
};
