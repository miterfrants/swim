import {
    BaseComponent
} from '../../swim/base.component.js';

export class TestRecursiveTwoLevelComponent extends BaseComponent {
    constructor(elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'TestRecursiveTwoLevelComponent';
    }

    async render() {
        await super.render({
            ...this.variable
        });
    }
}