import {
    BaseComponent
} from '../../swim/base.component.js';

export class TodoItemComponent extends BaseComponent {
    constructor(elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'TodoItemComponent';
    }

    async render() {
        await super.render({
            ...this.variable
        });
    }

    delete(e) {
        const event = new CustomEvent('delete', {
            detail: {
                id: this.variable.id
            }
        });
        this.elHTML.dispatchEvent(event);
        e.stopPropagation();
    }

    toggleStatus(e) {
        let eventName = 'check';
        if (this.variable.status === 'checked') {
            eventName = 'uncheck';
        }
        const event = new CustomEvent(eventName, {
            detail: {
                id: this.variable.id
            }
        });
        this.elHTML.dispatchEvent(event);
        e.stopPropagation();
    }

    toogleSelect() {
        const event = new CustomEvent('select', {
            detail: {
                id: this.variable.id
            }
        });
        this.elHTML.dispatchEvent(event);
    }
}