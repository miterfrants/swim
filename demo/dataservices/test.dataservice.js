import {
    ApiHelper
} from '/util/api.js';

import {
    API
} from '/constants.js';

import {
    APP_CONFIG
} from '/config.js';
import {
    Swissknife
} from '/util/swissknife.js';

export const TestDataService = {
    getOne: async (data) => {
        let api = APP_CONFIG.API_ENDPOINT + API.TEST;
        api = api.bind(data);
        api = Swissknife.removeEmptyQueryString(api);
        return ApiHelper.sendRequest(api, {
            method: 'GET'
            //, headers: {
            //     'Authorization': 'Bearer ' + data.token
            // }
        });
    }
};