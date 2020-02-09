import {
    BaseComponent
} from '../../swim/base.component.js';

export class TestNoValueAttributeComponent extends BaseComponent {
    constructor(elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'TestNoValueAttributeComponent';
    }

    async render() {
        await super.render({
            ...this.variable
        });
    }
}