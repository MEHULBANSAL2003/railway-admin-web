import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";
import {ApiConstants} from "../constants/ApiConstants.js";

const fare_rule_base_url =  import.meta.env.VITE_API_FARE_RULE_URL;

export const FareRuleService = {

  getAllForAdmin: (trainTypeCode, coachTypeCode, quotaCode) => {
    const params = {};
    if (trainTypeCode) params.trainTypeCode = trainTypeCode;
    if (coachTypeCode) params.coachTypeCode = coachTypeCode;
    if(quotaCode) params.quotaCode = quotaCode;

    const url = `${fare_rule_base_url}${ApiConstants.getAllFareRules}`;

    return HttpWrapper.get(url, params, true);
  },

  getComboHistory: (trainTypeCode, coachTypeCode) => {
    const url = `${fare_rule_base_url}${ApiConstants.getFareRuleHistory}`;
    return HttpWrapper.get(url, { trainTypeCode, coachTypeCode }, true);
  },

  addFareRule: (payload) => {
    const url = `${fare_rule_base_url}${ApiConstants.addFareRules}`;
    return HttpWrapper.post(url, payload, true);
  },

  toggleStatus: (ruleId, isActive) => {
    const url = `${fare_rule_base_url}${ApiConstants.changeFareRuleStatus}`;
    return HttpWrapper.postByIdWithQueryParams(url, ruleId, { isActive }, true);
  },
};
