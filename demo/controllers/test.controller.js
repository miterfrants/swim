import {
    RoutingController
} from '../swim/routing-controller.js';
import {
    TestDataService
} from '../dataservices/test.dataservice.js';
import {
    RESPONSE_STATUS
} from '../constants.js';
import {
    Toaster
} from '../util/toaster.js';

export class TestController extends RoutingController {
    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
    }

    async enter(args) {
        super.enter(args);
    }

    async render() {
        const resp = await TestDataService.getOne();
        if (resp.status === RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.INFO, '取得資料成功');
        } else {
            Toaster.popup(Toaster.TYPE.ERROR, '取得資料失敗');
        }
        await super.render({
            price: 0,
            list: [{
                name: 'peter',
                age: 23
            }, {
                name: 'mark',
                age: 11
            }],
            test: [{
                option: 1
            }, {
                option: 2
            }],
            noValueAttr1: 'a',
            noValueAttr2: 'b',
            attrValue1: 'c',
            attrValue2: 'd',
            textNode: 'e',
            noValueAttrInComponent1: 'f',
            noValueAttrInComponent2: 'g',
            attrValueInComponent1: 'h',
            attrValueInComponent2: 'i',
            bindingTwiceVariable: 'j',
            bindingTwiceInComponentAndSwimFor: 'k',
            swimForComponent: 'l',
            listForSwimFor: [{
                name: 1
            }, {
                name: 2
            }],
            testRecursiveOneLevel: '1'
        });
    }

    async postRender() {}

    async exit(args) {
        return super.exit(args);
    }

    updateNoValueAttr1(e) {
        this.pageVariable.noValueAttr1 = e.currentTarget.value;
    }

    updateNoValueAttr2(e) {
        this.pageVariable.noValueAttr2 = e.currentTarget.value;
    }

    updateAttrValue1(e) {
        this.pageVariable.attrValue1 = e.currentTarget.value;
    }

    updateAttrValue2(e) {
        this.pageVariable.attrValue2 = e.currentTarget.value;
    }

    updateTextNode(e) {
        this.pageVariable.textNode = e.currentTarget.value;
    }

    updateNoValueAttrInComponent1(e) {
        this.pageVariable.noValueAttrInComponent1 = e.currentTarget.value;
    }

    updateNoValueAttrInComponent2(e) {
        this.pageVariable.noValueAttrInComponent2 = e.currentTarget.value;
    }


    updateAttrValueInComponent1(e) {
        this.pageVariable.attrValueInComponent1 = e.currentTarget.value;
    }

    updateAttrValueInComponent2(e) {
        this.pageVariable.attrValueInComponent2 = e.currentTarget.value;
    }

    updateBindingTwice(e) {
        this.pageVariable.bindingTwiceVariable = e.currentTarget.value;
    }

    updateBindingTwiceInComponentAndSwimFor(e) {
        this.pageVariable.bindingTwiceInComponentAndSwimFor = e.currentTarget.value;
    }

    updateSwimForComponent(e) {
        this.pageVariable.swimForComponent = e.currentTarget.value;
    }

    appendItemToListForSwimFor(e) {
        this.pageVariable.listForSwimFor.unshift({
            name: 3
        });
    }

    updateTestRecursiveOneLevel(e) {
        this.pageVariable.testRecursiveOneLevel = e.currentTarget.value;
    }
}