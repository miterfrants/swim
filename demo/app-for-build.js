import {
    Router
} from './swim/router.js';

import {
    CustomError,
    CUSTOM_ERROR_TYPE
} from './util/custom-error.js';

import {
    extendStringProtoType,
    extendHTMLElementProtoType
} from './util/extended-prototype.js';

import {
    Toaster
} from './util/toaster.js';

import {
    Cacher
} from './swim/cacher.js';

Cacher.buildCache();
extendStringProtoType();
extendHTMLElementProtoType();

export const APP = {
    run: (isUpdateDOMFirstRunRouting) => {
        window.addEventListener('error', (e) => {
            if (e.error && e.error instanceof CustomError) {
                if (e.error.type === CUSTOM_ERROR_TYPE.API_RESPONSE_TOO_LONG) {
                    console.error(e);
                } else {
                    Toaster.popup(Toaster.TYPE.ERROR, e.error.reason);
                }
                e.stopPropagation();
                e.preventDefault();
                return;
            }
        });

        window.addEventListener('unhandledrejection', function (e) {
            if (e.reason && e.reason instanceof CustomError) {
                if (e.reason.type === CUSTOM_ERROR_TYPE.API_RESPONSE_TOO_LONG) {
                    console.error(e);
                } else {
                    Toaster.popup(Toaster.TYPE.ERROR, e.reason);
                }
                e.stopPropagation();
                e.preventDefault();
                return;
            } else {
                Toaster.popup(Toaster.TYPE.ERROR, '系統發生未預期的錯誤');
            }
        });
        APP.isUpdateDOMFirstRunRouting = !!isUpdateDOMFirstRunRouting;
        Router.init(APP);
    }
};
window.APP = APP;