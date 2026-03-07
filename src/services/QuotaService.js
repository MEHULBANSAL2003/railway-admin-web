import {HttpWrapper} from "../httpWrapper/HttpWrapper.js";
import {ApiConstants} from "../constants/ApiConstants.js";

const quota_base_url =  import.meta.env.VITE_API_QUOTA_URL;


export const QuotaService = {

  getAllForDropdown: () => {
    const url = `${quota_base_url}${ApiConstants.getAllQuotas}`;
    return HttpWrapper.get(url, null, true);
  },

  getAllForAdmin: () => {
    const url = `${quota_base_url}${ApiConstants.getAllQuotasForAdmin}`;
    return HttpWrapper.get(url, null, true);
  },

  addQuota: (payload) => {
    const url = `${quota_base_url}${ApiConstants.addQuotas}`;
    return HttpWrapper.post(url, payload, true);
  },

  // updateQuota: (quotaCode, payload) => {
  //   const url = `${quota_base_url}${ApiConstants.}`;
  //   return HttpWrapper.patch(BASE + '/update/' + quotaCode, payload, null, true);
  // },

  toggleStatus: async (quotaCode, isActive) => {
    const url = `${quota_base_url}${ApiConstants.changeQuotaStatus}`;
    return await HttpWrapper.postByIdWithQueryParams(url, quotaCode, { isActive }, true);
  },

  getCascadeInfo: async (typeCode) => {
    const url = `${quota_base_url}/cascade-info/${typeCode}`;
    return await HttpWrapper.get(url, null, true);
  },


};
