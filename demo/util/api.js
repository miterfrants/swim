import {
    RESPONSE_STATUS
} from '../constants.js';
import {
    CUSTOM_ERROR_TYPE,
    CustomError
} from './custom-error.js';

if (!window['AppApiCache']) {
    window['AppApiCache'] = {};
}

export const ApiHelper = {
    sendRequest: (api, fetchOption, withoutCache, callbackFunc) => {
        return new Promise(async (resolve) => { // eslint-disable-line
            const processStartTime = new Date();
            let result;
            const newOption = {
                ...fetchOption
            };
            delete newOption.headers;
            if (
                fetchOption.method === 'GET' &&
                window.AppApiCache[api] !== undefined &&
                window.AppApiCache[api][JSON.stringify(newOption)] !== undefined &&
                withoutCache !== true
            ) {
                result = window.AppApiCache[api][JSON.stringify(newOption)];
                resolve(result);
                if (new Date() - processStartTime > 1000) {
                    throw new CustomError(CUSTOM_ERROR_TYPE.API_RESPONSE_TOO_LONG, `api: ${api}, fetchOption: ${JSON.stringify(fetchOption)}`);
                }
                return;
            }

            if (
                fetchOption.method !== 'GET'
            ) {
                // refactor 現在的做法是只要發生 http method 不是 get 就把整個 cache 清掉，未來的作法應該是 API Response 會對應到 client 端 DB
                window.AppApiCache = {};
            }
            let resp;
            try {
                resp = await ApiHelper.fetch(api, fetchOption, withoutCache);
            } catch (error) {
                result = {
                    status: RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: error
                    }
                };
                resolve(result);
                if (new Date() - processStartTime > 1000) {
                    throw new CustomError(CUSTOM_ERROR_TYPE.API_RESPONSE_TOO_LONG, `api: ${api}, fetchOption: ${JSON.stringify(fetchOption)}`);
                }
                return;
            }
            if (resp.status === 200) {
                const jsonData = await resp.json();
                result = {
                    status: RESPONSE_STATUS.OK,
                    httpStatus: resp.status,
                    data: jsonData
                };
                if (fetchOption.method === 'GET') {
                    window.AppApiCache[api] = window.AppApiCache[api] || {}; // eslint-disable-line
                    const newOption = {
                        ...fetchOption
                    };
                    delete newOption.headers;
                    window.AppApiCache[api][JSON.stringify(newOption)] = result; // eslint-disable-line
                }
            } else {
                const jsonData = await resp.json();
                result = {
                    status: RESPONSE_STATUS.FAILED,
                    httpStatus: resp.status,
                    data: {
                        message: jsonData.message
                    }
                };
            }
            if (callbackFunc) {
                callbackFunc(result);
            }
            resolve(result);
            if (new Date() - processStartTime > 1000) {
                throw new CustomError(CUSTOM_ERROR_TYPE.API_RESPONSE_TOO_LONG, `api: ${api}, fetchOption: ${JSON.stringify(fetchOption)}`);
            }
        });
    },
    fetch: (url, option) => {
        if (option.cache) {
            console.warn('Cound not declate cache in option params');
        }
        if (!option.headers) {
            option.headers = {};
        }
        if (option.headers['Content-Type'] === null) {
            delete option.headers['Content-Type'];
        } else {
            option.headers['Content-Type'] = 'application/json';
        }
        const newOption = {
            ...option,
            headers: {
                ...option.headers,
            }
        };
        return fetch(url, newOption);
    }
};