import {
    BaseComponent
} from '../../swim/base.component.js';

export class TestAttrValueComponent extends BaseComponent {
    constructor(elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'TestAttrValueComponent';
    }

    async render() {
        await super.render({
            ...this.variable
        });
    }
}