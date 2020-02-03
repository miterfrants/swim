import {
    Loader
} from '/swim/loader.js';
import {
    Render
} from '/swim/render.js';

export class BaseComponent {
    constructor(elRoot, variable, args) {
        this.elRoot = elRoot;
        this.variable = variable;
        this.args = args;
        this.template = '';
        this.elHTML = null;
    }

    async render(variable) {
        this.variable = variable;
        // load html
        let htmlFileName = this.camelToSnake(this.constructor.name.substring(0, this.constructor.name.toLowerCase().lastIndexOf('component')));
        const loader = new Loader();
        const html = await loader.loadHTML(`/components/${htmlFileName}/${htmlFileName}.html`);
        this.template = html;
        this.elHTML = html.toDom();
        // bind variable and event listener
        Render.bindingVariableToDom(this, this.elHTML, variable, this.args);
        Render.renderComponentAsync(this.elHTML, variable, this.args, this);
        this.elRoot.appendChild(this.elHTML);
    }

    camelToSnake(string) {
        return string.replace(/[\w]([A-Z])/g, function (m) {
            return m[0] + '-' + m[1];
        }).toLowerCase();
    }
}