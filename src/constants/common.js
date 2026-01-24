import {isBrowser} from "../utils/Storage.js";
import {Storage} from "../utils/Storage.js";


const businessId = 12;
const APP_ID_WEB = 4;
const APP_ID_WEB_MOBILE = 3;
const appVersion = 1.2;

export const common = {

  getBusinessId : () =>{
    return businessId;
  },
  checkDeviceIsBrowser: ()=>{
    return isBrowser;
  },
  setItem: (name, value) => {
    if(value && value !== "") {
      Storage.set(name, value);
    }
  },

  getItem: (name) => {
    return Storage.get(name) ?? '';
  },
  removeItem: (name) => {
    Storage.remove(name);
  },

  setSession: (key, value) => {
    if (common.checkDeviceIsBrowser()) {
      sessionStorage.setItem(key, value);
    }
  },
  getSession:(key)=> {
    if (common.checkDeviceIsBrowser()) {
      const data = sessionStorage.getItem(key);
      if (data != null && data !== '') {
        return data;
      }
    }
    return null;
  },
  removeSession: (key) => {
    if (common.checkDeviceIsBrowser()) {
      sessionStorage.removeItem(key);
    }
  },

  setUserData : (data) => {
    if (data.isForeign) {
      common.setItem('timeZone', 'foreign');
    } else {
      common.setItem('timeZone', 'Asia/Kolkata');
    }
    common.setItem('userData', JSON.stringify(data));

  },
  getUserData : (key='') => {
  if (common.checkDeviceIsBrowser()) {
    const jsonData = common.getItem('userData');
    if (jsonData && jsonData !== '') {
      const userData = JSON.parse(jsonData);
      if (key) {
        return (userData && userData[key]) ? userData[key] : '';
      }
      return userData;
    }
  }
  return '';
},

  setAccessToken: (token) => {
    const tokenKey = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    if (token) {
      common.setItem(tokenKey, token);
    }
  },

  getAccessToken: () => {
    const tokenKey = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    return common.getItem(tokenKey);
  },

  removeAccessToken: () => {
    const tokenKey = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    common.removeItem(tokenKey);
  },

  setRefreshToken: (token) => {
    const tokenKey = import.meta.env.VITE_REFRESH_TOKEN_KEY;
    if (token) {
      common.setItem(tokenKey, token);
    }
  },

  getRefreshToken: () => {
    const tokenKey = import.meta.env.VITE_REFRESH_TOKEN_KEY;
    return common.getItem(tokenKey);
  },

  removeRefreshToken: () => {
    const tokenKey = import.meta.env.VITE_REFRESH_TOKEN_KEY;
    common.removeItem(tokenKey);
  },

  checkDeviceIsMobile: () => {
  const ua = navigator.userAgent;

  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|CriOS/i.test(ua);
  const isSmallScreen = window.innerWidth <= 576;

  return isMobileUA && isSmallScreen;
},

  getAppId : () => {
  if (common.checkDeviceIsMobile()) {
    return APP_ID_WEB_MOBILE;
  } else {

    return APP_ID_WEB;
  }
},

  getAppVersion : () => {
  return appVersion;
},

  timeZone : () => {
  const timeZone = common.getItem('timeZone');
  if ((typeof (timeZone) == 'undefined') || timeZone === '') {
    return 'Asia/Kolkata';
  }
  return timeZone;
},
  logout:() =>  {
    common.removeItem('userData');
    common.removeAccessToken();
    common.removeRefreshToken();
  },
}
