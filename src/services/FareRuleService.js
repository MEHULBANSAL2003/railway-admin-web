import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";
import {ApiConstants} from "../constants/ApiConstants.js";

const fare_rule_base_url =  import.meta.env.VITE_API_FARE_RULE_URL;

export const FareRuleService = {

  getAllForAdmin: async (trainTypeCode, coachTypeCode, quotaCode) => {
    const params = {};
    if (trainTypeCode) params.trainTypeCode = trainTypeCode;
    if (coachTypeCode) params.coachTypeCode = coachTypeCode;
    if(quotaCode) params.quotaCode = quotaCode;

    const url = `${fare_rule_base_url}${ApiConstants.getAllFareRules}`;

    return await HttpWrapper.get(url, params, true);
  },

  getComboHistory: async (trainTypeCode, coachTypeCode, quotaCode) => {
    const url = `${fare_rule_base_url}${ApiConstants.getFareRuleHistory}`;
    return await HttpWrapper.get(url, { trainTypeCode, coachTypeCode, quotaCode }, true);
  },

  addFareRule: async (payload) => {
    const url = `${fare_rule_base_url}${ApiConstants.addFareRules}`;
    return await HttpWrapper.post(url, payload, true);
  },

  toggleStatus: async (ruleId, payload) => {
    const url = `${fare_rule_base_url}${ApiConstants.changeFareRuleStatus}/${ruleId}`;
    return await HttpWrapper.post(url, payload, true);
  },
};
