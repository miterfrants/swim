import {
    TestController
} from './controllers/test.controller.js';

import {
    TodosRoutingRule
} from './routing-rules/todos.routing-rule.js';

export const RoutingRule = [{
    path: '/test/',
    controller: TestController,
    html: '/template/test.html'
}, TodosRoutingRule];