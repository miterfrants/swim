import {
    TestController
} from './controllers/test.controller.js';

export const RoutingRule = [{
    path: '/test/',
    controller: TestController,
    html: '/template/test.html'
}];