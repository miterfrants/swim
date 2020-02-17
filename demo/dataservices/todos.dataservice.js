import {
    ApiHelper
} from '../util/api.js';

import {
    API
} from '../constants.js';

import {
    APP_CONFIG
} from '../config.js';

import {
    Swissknife
} from '../util/swissknife.js';

export const TodosDataService = {
    getList: async (data) => {
        let api = APP_CONFIG.API_ENDPOINT + API.TODOS;
        api = api.bind(data);
        api = Swissknife.removeEmptyQueryString(api);
        return ApiHelper.sendRequest(api, {
            method: 'GET'
        });
    }
};