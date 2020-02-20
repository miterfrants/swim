import {
    Loader
} from './loader.js';
import {
    Render
} from './render.js';

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
        let htmlFileName = this.camelToSnake(this.id.substring(0, this.id.toLowerCase().lastIndexOf('component')));
        const loader = new Loader();
        let html = await loader.loadHTML(`/components/${htmlFileName}/${htmlFileName}.html`);
        html = Render.appendStylesheetToHeadAndRemoveLoaded(html);
        this.template = html;
        this.elHTML = html.toDom();
        Render.bindingVariableToDom(this, this.elHTML, variable, this.args);
        Render.renderComponentAsync(this.elHTML, variable, this.args, this);
        this.elRoot.appendChild(this.elHTML);
    }

    async postRender() {
        if (this.elHTML) {
            Render.bindingEvent(this.elHTML, this);
        }
        if (this.elHTML) {
            this.elHTML.querySelectorAll('*').forEach(async (el) => {
                if (el && el.tagName.toLowerCase().indexOf('component-') !== -1 && el.componentInstance) {
                    el.componentInstance.postRender();
                }
            });
        }
    }

    camelToSnake(string) {
        return string.replace(/[\w]([A-Z])/g, function (m) {
            return m[0] + '-' + m[1];
        }).toLowerCase();
    }
}