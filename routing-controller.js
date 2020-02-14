import {
    Render
} from './render.js';

export class RoutingController {
    constructor(elHTML, parentController, args, context) {
        this.args = args;
        this.elHTML = elHTML;
        this.originalHTML = elHTML ? elHTML.outerHTML : ''; // restore html string;
        this.context = context;
        this.elOriginalChildNodes = [];
        this.parentController = parentController;
        this.pageVariable = null;
        if (elHTML) {
            const classQuery = elHTML.className.split(' ').map((className) => {
                return `.${className}`;
            }).join('');

            if (classQuery === '.') {
                console.error(`${this.constructor.name}: root html need a class name`);
                return;
            }

            if (document.querySelector(classQuery)) {
                this.elHTML = document.querySelector(classQuery);
            } else {
                this.elHTML = elHTML;
            }
            // fix: if binding event on elHTML not in dom tree
            saveOriginalChildRouter(this, elHTML);
        }
    }

    async enter(args) {
        this.args = args;
    }

    async render(pageVariable) {
        this.pageVariable = pageVariable;
        if (this.elHTML && this.context.isUpdateDOMFirstRunRouting) {
            revertOriginalChildRouter(this);
            // copy original text to controller elHTML;
            this.elHTML = Render.removeLoadedStylesheet(this.originalHTML).toDom();

            // search component
            // refactor: use xpath
            Render.bindingVariableToDom(this, this.elHTML, this.pageVariable, this.args);
            await Render.renderComponentAsync(this.elHTML, this.pageVariable, this.args, this);
            updateDOM(this);
        }
    }

    async exit() {
        return true;
    }
}

function updateDOM(controllerInstance) {
    let container = null;
    let parentController = controllerInstance.parentController;
    const elRoot = document.querySelector('.root');
    if (!parentController) {
        container = elRoot;
    } else {
        const concreteParent = recrusiveFindConcreteParent(parentController);
        if (concreteParent) {
            container = concreteParent.elHTML.querySelector('.child-router');
        } else {
            container = elRoot;
        }
    }

    if (container) {
        container.innerHTML = '';
        if (controllerInstance.elHTML.querySelector('.child-router')) {
            controllerInstance.elHTML.querySelector('.child-router').style.visibility = 'hidden';
        }
        container.appendChild(controllerInstance.elHTML);
    }
}

function recrusiveFindConcreteParent(parentController) {
    if (parentController.elHTML !== null) {
        return parentController;
    } else if (parentController.parentController) {
        return recrusiveFindConcreteParent(parentController.parentController);
    } else {
        // refactor: throw error
    }
}

function saveOriginalChildRouter(controllerInstance, sourceElHTML) {
    // handle stylesheets avoid duplicate load css file
    const stylesheets = [];
    sourceElHTML.childNodes.forEach((el) => {
        if (el.rel === 'stylesheet') {
            stylesheets.push(el);
        }
    });

    for (let i = 0; i < stylesheets.length; i++) {
        sourceElHTML.removeChild(stylesheets[i]);
        Render.appendStylesheetToHead(stylesheets[i]);
    }

    // save original elHTML childNodes
    const elChildRouter = sourceElHTML.querySelector('.child-router');
    if (elChildRouter) {
        elChildRouter.childNodes.forEach((childNode) => {
            controllerInstance.elOriginalChildNodes.push(childNode);
        });
    }
}

function revertOriginalChildRouter(controllerInstance) {
    const elChildRouter = controllerInstance.elHTML.querySelector('.child-router');
    if (elChildRouter) {
        elChildRouter.innerHTML = '';
        for (let i = 0; i < controllerInstance.elOriginalChildNodes.length; i++) {
            elChildRouter.appendChild(controllerInstance.elOriginalChildNodes[i]);
        }
    }
}