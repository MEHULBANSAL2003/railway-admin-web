// searchFetchers.js
import { StatesCitiesService } from '../services/StatesCitiesService.js';
import { ZoneService }         from '../services/ZoneService.js';

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
