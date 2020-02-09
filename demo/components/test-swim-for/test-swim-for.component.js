import {
    BaseComponent
} from '../../swim/base.component.js';

export class TestSwimForComponent extends BaseComponent {
    constructor(elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'TestSwimForComponent';
    }

    async render() {
        await super.render({
            ...this.variable
        });
    }
}