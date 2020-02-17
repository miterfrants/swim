import {
    RoutingController
} from '../swim/routing-controller.js';

import {
    TodosDataService
} from '../dataservices/todos.dataservice.js';

import {
    RESPONSE_STATUS
} from '../constants.js';

import {
    Toaster
} from '../util/toaster.js';

export class TodosController extends RoutingController {
    static get id() {
        return 'TodosController';
    }

    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
    }

    async enter(args) {
        super.enter(args);
    }

    async render() {
        const todos = await this._getList();
        // server & client site render
        super.render({
            todos,
            selectedTodoItemTitle: '',
            selectedTodoItemId: -1,
            editPanelClass: 'hide',
            addPanelClass: '',
            barberLampTop: 0,
            barberStatusClass: ''
        });
    }

    async postRender() {
        // binding event
    }

    async exit(args) {
        return super.exit(args);
    }

    async _getList() {
        const resp = await TodosDataService.getList();
        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, 'Get todo list error!');
            return [];
        }
        for (let i = 0; i < resp.data.length; i++) {
            resp.data[i].selected = '';
        }
        return resp.data;
    }

    async add(e) {
        const elTodoForm = e.currentTarget.recurisiveFindParentByClass('add-todo-form');
        const data = elTodoForm.collectFormData();
        this.pageVariable.todos.unshift({
            id: this.pageVariable.todos.length + 1,
            status: 'pending',
            title: data.title
        });
        elTodoForm.clearForm();
    }

    async addAfterClickEnter(e) {
        if (e.keyCode === 13) {
            this.add(e);
        }
    }

    async delete(e) {
        const deleteTargetIndex = this.pageVariable.todos.findIndex((item) => {
            return item.id === e.detail.id;
        });

        this.pageVariable.todos.splice(deleteTargetIndex, 1);

        if (e.detail.id === this.pageVariable.selectedTodoItemId) {
            this.pageVariable.selectedTodoItemId = -1;
            this.pageVariable.selectedTodoItemTitle = '';
            this._revertToInitialState();
        } else if (this.pageVariable.selectedTodoItemId !== -1) {
            const targetIndex = this.pageVariable.todos.findIndex((item) => {
                return item.id === this.pageVariable.selectedTodoItemId;
            });
            this.pageVariable.barberLampTop = this.pageVariable.barberLampTop = this._calculateBarberLampTop(targetIndex);
        }
    }

    async check(e) {
        const targetIndex = this.pageVariable.todos.findIndex((item) => {
            return item.id === e.detail.id;
        });
        this.pageVariable.todos[targetIndex].status = 'checked';
    }

    async uncheck(e) {
        const targetIndex = this.pageVariable.todos.findIndex((item) => {
            return item.id === e.detail.id;
        });
        this.pageVariable.todos[targetIndex].status = 'pending';
    }

    async toogleSelectToDoItem(e) {
        this.pageVariable.todos.forEach((todo) => {
            todo.selected = '';
        });
        const targetIndex = this.pageVariable.todos.findIndex((item) => {
            return item.id === e.detail.id;
        });
        if (this.pageVariable.selectedTodoItemId === this.pageVariable.todos[targetIndex].id) {
            this.pageVariable.selectedTodoItemId = -1;
            this.pageVariable.selectedTodoItemTitle = '';
            this._revertToInitialState();
        } else {
            this.pageVariable.selectedTodoItemTitle = this.pageVariable.todos[targetIndex].title;
            this.pageVariable.selectedTodoItemId = this.pageVariable.todos[targetIndex].id;
            this.pageVariable.todos[targetIndex].selected = 'selected';
            this.pageVariable.barberLampTop = this._calculateBarberLampTop(targetIndex);
            this.pageVariable.barberStatusClass = 'on';
            // switch to edit mode;
            this.pageVariable.editPanelClass = '';
            this.pageVariable.addPanelClass = 'hide';
            const elTodoInput = this.elHTML.querySelector('.update-todo-form .todo-input');
            elTodoInput.focus();
            elTodoInput.select(0, this.pageVariable.selectedTodoItemTitle.length);
        }
    }

    async update(e) {
        const elTodoForm = e.currentTarget.recurisiveFindParentByClass('update-todo-form');
        const data = elTodoForm.collectFormData();
        const targetIndex = this.pageVariable.todos.findIndex((item) => {
            return item.id === Number(data.id);
        });
        this.pageVariable.todos[targetIndex].title = data.title;
        elTodoForm.clearForm();
        // switch to edit mode;
        this._revertToInitialState();
    }

    async updateAfterClickEnter(e) {
        if (e.keyCode === 13) {
            this.update(e);
        }
    }


    _calculateBarberLampTop(index) {
        return this.elHTML.querySelector(`component-todo-item:nth-child(${index+1})`).offsetTop - 20;
    }

    _revertToInitialState() {
        this.pageVariable.editPanelClass = 'hide';
        this.pageVariable.addPanelClass = '';
        this.pageVariable.barberLampTop = 0;
        this.pageVariable.barberStatusClass = '';
    }
}