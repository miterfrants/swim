import {
    TodosController
} from '../controllers/todos.controller.js';

export const TodosRoutingRule = {
    path: '/todos/',
    controller: TodosController,
    html: '/template/todos.html'
};