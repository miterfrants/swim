import {
    BaseComponent
} from '/swim/base.component.js';

export class TestBindingTwiceAndSwimForComponent extends BaseComponent {
    constructor(elRoot, variable, args) {
        super(elRoot, variable, args);
    }

    async render() {
        await super.render({
            ...this.variable,
            list: [{
                name: 'peter',
            }, {
                name: 'frank'
            }]
        });
    }

    appendNewItemToList() {
        this.variable.list.unshift({
            name: 'tank'
        });
    }
}