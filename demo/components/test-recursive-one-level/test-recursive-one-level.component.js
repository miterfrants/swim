import {
    BaseComponent
} from '/swim/base.component.js';

export class TestRecursiveOneLevelComponent extends BaseComponent {
    constructor(elRoot, variable, args) {
        super(elRoot, variable, args);
    }

    async render() {
        await super.render({
            ...this.variable
        });
    }
}