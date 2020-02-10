import {
    Loader
} from './loader.js';
export const Render = {
    level: 0,
    debug: (info) => {
        let prefix = '';
        const alignment = '----';
        for (let i = 0; i < Render.level; i++) {
            prefix += alignment;
        }
        // console.log(`${prefix}${info}`);
    },
    renderComponentAsync: async (elHTML, pageVariable, args, controller) => {
        elHTML.querySelectorAll('*').forEach(async (el) => {
            if (el && el.tagName.toLowerCase().indexOf('component-') !== -1) {
                const componentInfo = Render._getComponentInfo(el.tagName.toLowerCase());
                const varKeys = el.getAttribute('variable') ? el.getAttribute('variable').split(',') : [];
                const variable = {};
                for (let i = 0; i < varKeys.length; i++) {
                    if (pageVariable[varKeys[i]] !== undefined) {
                        variable[varKeys[i]] = pageVariable[varKeys[i]];
                    }
                }
                let componentClass;
                try {
                    if (window.SwimAppComponents && window.SwimAppComponents[componentInfo.moduleName]) {
                        componentClass = window.SwimAppComponents[componentInfo.moduleName];
                    } else {
                        const loader = new Loader();
                        componentClass = await loader.loadJS(componentInfo.url, componentInfo.moduleName);
                    }
                } catch (error) {
                    console.error(`${componentInfo.moduleName} module name wrong`);
                }

                const componentInstance = new componentClass(el, variable, args);
                for (let key in variable) {
                    Render.registComponentToVariable(pageVariable, key, componentInstance, key);
                }
                await componentInstance.render();
                // binding event;
                el.getAttributeNames().forEach((attrName) => {
                    if (attrName.indexOf('on-') === 0) {
                        const funcName = el.getAttribute(attrName).replace(/controller\./gi, '');
                        if (controller[funcName]) {
                            componentInstance.elHTML.addEventListener(attrName.replace(/on-/gi, ''), (e) => {
                                controller[funcName](e);
                            });
                        }
                    }
                });
                if (componentInstance.postRender) {
                    await componentInstance.postRender();
                }
            }
        });
    },
    appendStylesheetToHead: (elStylesheet) => {
        const styleLink = elStylesheet.href.replace(location.origin, '');
        if (window.SwimAppStylesheet.indexOf(styleLink) !== -1) {
            return;
        }
        document.head.appendChild(elStylesheet);
        window.SwimAppStylesheet.push(elStylesheet.href);
    },
    bindingVariableToDom: (controller, elRoot, variable, args) => {
        Render._renderSwimFor(elRoot, variable, controller, args);
        Render._bindingEvent(elRoot, controller);
        Render._bindingVariableAndWatch(elRoot, variable);
    },
    registElementToVariable(variable, propertyName, element, type, originalTemplate) {
        let variableBindingElementsKey = Render._getBindingElementsKey(propertyName);
        if (!variable[variableBindingElementsKey]) {
            variable[variableBindingElementsKey] = [];
        }
        const target = variable[variableBindingElementsKey].find((item) => {
            return item.ref === element;
        });
        if (!target) {
            variable[variableBindingElementsKey].push({
                type,
                ref: element,
                originalValue: originalTemplate || ''
            });
        }
    },
    registComponentToVariable(variable, propertyName, componentInstance, propertyNameInComponent) {
        let variableBindingComponentKey = Render._getBindingComponentsKey(propertyName);
        if (!variable[variableBindingComponentKey]) {
            variable[variableBindingComponentKey] = [];
        }
        const target = variable[variableBindingComponentKey].find((item) => {
            return item.ref === componentInstance;
        });
        if (!target) {
            variable[variableBindingComponentKey].push({
                ref: componentInstance,
                propertyName: propertyNameInComponent
            });
        }
    },
    removeLoadedStylesheet(htmlString) {
        const stylesheetTags = Render._extractStyleLinkTags(htmlString);
        for (let i = 0; i < stylesheetTags.length; i++) {
            const stylesheetHref = this._extractStyleSheetHref(stylesheetTags[i]);
            if (window.SwimAppStylesheet.indexOf(stylesheetHref) !== -1) {
                htmlString = htmlString.replace(stylesheetTags[i], '');
            }
        }
        return htmlString;
    },
    _extractStyleLinkTags(htmlString) {
        const result = [];
        let currentPosistion = 0;
        let start, end;
        while (htmlString.indexOf('<link', currentPosistion) !== -1) {
            start = htmlString.indexOf('<link', currentPosistion);
            end = htmlString.indexOf('>', start + 1);
            const linkTagString = htmlString.substring(start, end + 1);
            if (linkTagString.indexOf('rel="stylesheet"') !== -1) {
                result.push(linkTagString);
            }
            currentPosistion = end + 1;
        }
        return result;
    },
    _extractStyleSheetHref(linkTagString) {
        const hrefStartPos = linkTagString.indexOf('href');
        const hrefQuoteStartPos = linkTagString.indexOf('"', hrefStartPos + 1);
        const hrefQuoteEndPos = linkTagString.indexOf('"', hrefQuoteStartPos + 1);
        return linkTagString.substring(hrefQuoteStartPos + 1, hrefQuoteEndPos);
    },
    _renderSwimFor: (elRoot, variable, controller, args) => {
        for (let propertyName in variable) {
            if (!Array.isArray(variable[propertyName])) {
                continue;
            }
            const loopRenderContainers = [];
            elRoot.querySelectorAll(`[swim-for="${propertyName}"]`).forEach((elContainer) => {
                loopRenderContainers.push(elContainer);
                Render._renderSwimForMain(elContainer, variable[propertyName], controller, args);
            });

            let timer = null;
            if (loopRenderContainers.length > 0) {
                variable[propertyName].unshift = (item) => {
                    Array.prototype.unshift.apply(variable[propertyName], [item]);
                    clearTimeout(timer);
                    timer = setTimeout(async () => {
                        for (let i = 0; i < loopRenderContainers.length; i++) {
                            Render._renderSwimForMain(loopRenderContainers[i], variable[propertyName], controller, args);
                            Render.bindingVariableToDom(controller, loopRenderContainers[i], variable, args);
                            await Render.renderComponentAsync(loopRenderContainers[i], variable, args, controller);
                        }
                    });
                    return variable[propertyName];
                };

                variable[propertyName].splice = (index, number) => {
                    Array.prototype.splice.apply(variable[propertyName], [index, number]);
                    clearTimeout(timer);
                    timer = setTimeout(async () => {
                        for (let i = 0; i < loopRenderContainers.length; i++) {
                            Render._renderSwimForMain(loopRenderContainers[i], variable[propertyName], controller, args);
                            Render.bindingVariableToDom(controller, loopRenderContainers[i], variable, args);
                            await Render.renderComponentAsync(loopRenderContainers[i], variable, args, controller);
                        }
                    });
                    return variable[propertyName];
                };
            }
        }
    },
    _renderSwimForMain: async (elContainer, variable, controller, args) => {
        const itemTemplate = elContainer.template || elContainer.innerHTML;
        elContainer.template = itemTemplate;
        elContainer.innerHTML = '';
        if (Array.isArray(variable)) {
            for (let i = 0; i < variable.length; i++) {
                const elItem = itemTemplate.toDom();
                Render.bindingVariableToDom(controller, elItem, variable[i], args);
                if (elContainer.tagName === 'SELECT' && elContainer.hasAttribute('value')) {
                    if (elItem.value === elContainer.getAttribute('value')) {
                        elItem.setAttribute('selected', '');
                    }
                }
                elContainer.appendChild(elItem);
            }
        } else {
            console.warn('loop variable is not array');
        }
    },
    _bindingEvent: (elRoot, controller) => {
        elRoot.querySelectorAll('[onclick^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onclick').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                el.addEventListener('click', (e) => {
                    controller[funcName](e);
                });
                el.removeAttribute('onclick');
            }
        });

        elRoot.querySelectorAll('[onchange^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onchange').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                el.addEventListener('change', (e) => {
                    controller[funcName](e);
                });
                el.removeAttribute('onchange');
            }
        });
        elRoot.querySelectorAll('[onkeyup^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onkeyup').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                el.addEventListener('keyup', (e) => {
                    controller[funcName](e);
                });
                el.removeAttribute('onkeyup');
            }
        });

        elRoot.querySelectorAll('[onkeydown^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onkeydown').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                el.addEventListener('keydown', (e) => {
                    controller[funcName](e);
                });
                el.removeAttribute('onkeydown');
            }
        });

    },

    _getBindingElementsKey: (propertyName) => {
        return `__${propertyName}__elements`;
    },
    _getBindingComponentsKey: (propertyName) => {
        return `__${propertyName}__components`;
    },
    _getBindingElements(variable, propertyName) {
        let variableBindingElementsKey = Render._getBindingElementsKey(propertyName);
        return variable[variableBindingElementsKey];
    },

    _getBindingComponent(variable, propertyName) {
        let variableBindingComponentKey = Render._getBindingComponentsKey(propertyName);
        return variable[variableBindingComponentKey];
    },
    _refreshElementAttributeWithVariable(el, propertyName, newValue) {
        let attrNames = el.getAttributeNames();
        for (let j = 0; j < attrNames.length; j++) {
            const attrName = attrNames[j];
            let attrValue = el.originalAttribute[attrName];
            if (attrValue && attrValue.indexOf(`{${propertyName}}`) !== -1) {
                attrValue = attrValue.replace(`{${propertyName}}`, newValue);
                el.bindingAttributes[attrName][propertyName] = newValue;
                for (let key in el.bindingAttributes[attrName]) {
                    attrValue = attrValue.replace(`{${key}}`, el.bindingAttributes[attrName][key]);
                }
                el.setAttribute(attrName, attrValue);
            }
        }
    },
    _bindingVariableAndWatch: (elRoot, variableObj) => {
        for (let propertyName in variableObj) {
            if (propertyName.indexOf('_') === 0) {
                continue;
            }
            variableObj[`_${propertyName}`] = variableObj[propertyName];

            // attribute
            let query = document.evaluate(`//*[@*[contains(.,'{${propertyName}}')] or attribute::*[contains(local-name(), '{${propertyName.toLowerCase()}}')]]`, elRoot, null, XPathResult.ANY_TYPE, null);
            const elementsWithAttribute = [];
            let el = query.iterateNext();

            while (el) {
                elementsWithAttribute.push(el);
                el = query.iterateNext();
            }

            for (let i = 0; i < elementsWithAttribute.length; i++) {
                const element = elementsWithAttribute[i];
                let attrNames = element.getAttributeNames();
                for (let j = 0; j < attrNames.length; j++) {
                    const attrName = attrNames[j];
                    const attrValue = element.getAttribute(attrName);

                    if (element.tagName.toLowerCase() === 'select' && attrName === 'value' && attrValue.indexOf(`{${propertyName}}`) !== -1) {
                        Render.registElementToVariable(variableObj, propertyName, element, 'select');
                        element.value = variableObj[propertyName];
                    }

                    if (attrName === `{${propertyName.toLowerCase()}}`) {
                        Render.registElementToVariable(variableObj, propertyName, element, 'no-value-attribute', attrName);
                        element.removeAttribute(attrName);
                        if (variableObj[propertyName]) {
                            element.setAttribute(variableObj[propertyName], '');
                        }
                        continue;
                    }

                    if (attrValue.indexOf(`{${propertyName}}`) !== -1) {
                        element.originalAttribute = element.originalAttribute || [];
                        Render.registElementToVariable(variableObj, propertyName, element, 'attribute', element.originalAttribute[attrName]);
                        if (!element.originalAttribute[attrName]) {
                            element.originalAttribute[attrName] = attrValue;
                        }

                        if (!element.bindingAttributes) {
                            element.bindingAttributes = {};
                        }
                        if (!element.bindingAttributes[attrName]) {
                            element.bindingAttributes[attrName] = {};
                        }

                        if (variableObj[propertyName] === null || variableObj[propertyName] === undefined) {
                            element.setAttribute(attrName, element.getAttribute(attrName).replace(`{${propertyName}}`, ''));
                            element.bindingAttributes[attrName][propertyName] = '';
                        } else {
                            element.setAttribute(attrName, element.getAttribute(attrName).replace(`{${propertyName}}`, variableObj[propertyName]));
                            element.bindingAttributes[attrName][propertyName] = variableObj[propertyName];
                        }
                    }
                }
            }

            // text node
            query = document.evaluate(`//text()[contains(.,"{${propertyName}}")]`, elRoot, null, XPathEvaluator.ANY_TYPE, null);
            const elementsWithText = [];
            el = query.iterateNext();
            while (el) {
                elementsWithText.push(el);
                el = query.iterateNext();
            }

            for (let i = 0; i < elementsWithText.length; i++) {
                el = elementsWithText[i];
                el.template = el.template || el.textContent;
                Render.registElementToVariable(variableObj, propertyName, el, 'textnode', el.template);
                if (variableObj[propertyName] === null || variableObj[propertyName] === undefined) {
                    el.textContent = el.template.replace(`{${propertyName}}`, '');
                } else {
                    el.textContent = el.template.replace(`{${propertyName}}`, variableObj[propertyName]);
                }
            }

            const registResult = Object.defineProperty(variableObj, propertyName, {
                // refactor: debounce set
                set: function (newValue) {
                    const bindingElements = Render._getBindingElements(variableObj, propertyName);
                    if (bindingElements) {
                        for (let i = 0; i < bindingElements.length; i++) {
                            if (bindingElements[i].type === 'select') {
                                bindingElements[i].ref.value = newValue;
                            } else if (bindingElements[i].type === 'no-value-attribute') {
                                bindingElements[i].ref.removeAttribute(variableObj[propertyName]);
                                if (newValue) {
                                    bindingElements[i].ref.setAttribute(newValue, '');
                                }
                            } else if (bindingElements[i].type === 'attribute') {
                                Render._refreshElementAttributeWithVariable(bindingElements[i].ref, propertyName, newValue);
                            } else if (bindingElements[i].type === 'textnode') {
                                if (variableObj[propertyName] === null || variableObj[propertyName] === undefined) {
                                    bindingElements[i].ref.textContent = bindingElements[i].ref.template.replace(`{${propertyName}}`, '');
                                } else {
                                    bindingElements[i].ref.textContent = bindingElements[i].ref.template.replace(`{${propertyName}}`, newValue);
                                }
                            }
                        }
                    }

                    variableObj[`_${propertyName}`] = newValue;
                    const components = Render._getBindingComponent(variableObj, propertyName);
                    if (components) {
                        for (let i = 0; i < components.length; i++) {
                            components[i].ref.variable[components[i].propertyName] = newValue;
                        }
                    }
                    return;
                },
                get: function () {
                    return variableObj[`_${propertyName}`];
                }
            });
            if (!window.SwimAppRegisterElements) {
                window.SwimAppRegisterElements = [];
            }
            window.SwimAppRegisterElements.push({
                className: elRoot.className,
                propertyName,
                ref: registResult
            });
        }
    },
    _getComponentInfo: (tagName) => {
        const componentName = tagName.replace(/component-/gi, '');
        const componentUrl = `/components/${componentName}/${componentName}.component.js`;
        const arrayComponentName = componentName.split('-');
        for (let i = 0; i < arrayComponentName.length; i++) {
            arrayComponentName[i] = arrayComponentName[i].substring(0, 1).toUpperCase() + arrayComponentName[i].substring(1);
        }
        const componentModuleName = arrayComponentName.join('') + 'Component';
        return {
            url: componentUrl,
            moduleName: componentModuleName
        };
    }
};

async function awaitForEach(array, callback) {
    for (let i = 0; i < array.length; i++) {
        await callback(array[i]);
    }
}