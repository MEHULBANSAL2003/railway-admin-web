import {isBrowser} from "../utils/Storage.js";


const businessId = 12;
const APP_ID_WEB = 4;
const APP_ID_WEB_MOBILE = 3;
const appVersion = 1.2;

export const common = {

  getBrowserTimeZoneCountry : () => {
    var userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (userTimeZone === 'Asia/Calcutta') {
      userTimeZone = 'Asia/Kolkata';
    } else if (userTimeZone === 'Asia/Katmandu') {
      userTimeZone = 'Asia/Kathmandu';
    }
    var country = common.getMobileCode().find((country) => country.timeZone === userTimeZone);
    if (!country) {
      country = {
        name: 'India', dial_code: '+91', code: 'IN', timeZone: 'Asia/Kolkata'
      };
    }
    return country;
  },

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
  getUserData : (key='') => {
  if (this.checkDeviceIsBrowser()) {
    const jsonData = common.getItem('userData');
    if (jsonData && jsonData !== '') {
      const userData = JSON.parse(jsonData);
      if (key) {
        return (userData && userData[key]) ? userData[key] : '';
      }
      return userData;
    }
  } else if (!this.checkDeviceIsBrowser() && key === 'id') {

  } else if (!this.checkDeviceIsBrowser() && key == null) {
    return {
      'verifiedMobile': '8002858152',
      'id': null,
      'timeZone': 'Asia/Calcutta',
      'timeOfBirth': '03:22 PM',
      'dob': '01-January-2022',
      'lastName': '',
      'gender': 'male',
      'isForeign': false,
      'email': null,
      'placeOfBirth': 'Karjan, Gujarat, India',
      'profile_pic': 'https://aws.astrotalk.com/assets/images/astrotalk-mini-logo.webp',
      'name': 'User'
    };
  }
  return '';
},
getToken: () => {
  if (common.checkDeviceIsBrowser()) {
    return common.getItem(import.meta.env.VITE_APP_TOKEN || '');
  } else {
    // return this.getCookie(AppConstant.token);
  }
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
    common.setLocalTimeZone();
    common.removeItem(import.meta.env.VITE_APP_TOKEN ? import.meta.env.REACT_APP_TOKEN : '');
    common.removeItem('userData');
    common.removeItem('isToTakeVerifiedNo');
    common.removeItem('hasLanguage');
    common.removeItem('isToTakeVerifiedNo_firebase');
    common.removeItem('chatCallTip');
    common.removeItem('chatCall2ndTip');
    common.removeItem('fireBaseToken');
    common.removeItem('oldLogin');
    common.removeItem('liveEventUrl');
    common.removeItem('webview');
    common.removeItem('partner');
    common.removeItem('poOffer');
    common.removeItem('guestUser');
    common.removeItem('generateDetails');
    common.removeItem('notificationToken');
    common.removeItem('deviceData');
    // this.setLoginValue(false);
    let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const conversion = common.getWithExpiry('conRate');
    if (browserTimeZone === 'Asia/Calcutta' && (conversion && conversion?.isoCode !== 'INR')) {
      common.removeItem('conRate');
    }

  },

  getWithExpiry: (expiry) => {

  }

}
