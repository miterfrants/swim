import {
    Loader
} from './loader.js';
import { APP_CONFIG } from '../config.js';
export const Render = {
    renderComponentAsync: async (elHTML, pageVariable, args, controller) => {
        const elements = elHTML.querySelectorAll('*');
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            if (el && el.tagName.toLowerCase().indexOf('component-') !== -1) {
                const componentInfo = Render._getComponentInfo(el.tagName.toLowerCase());
                const varKeys = el.getAttribute('variable') ? el.getAttribute('variable').split(',') : [];
                const variable = {};
                const variableMapping = [];

                for (let i = 0; i < varKeys.length; i++) {
                    const value = Render._getValueFromJsonPath(pageVariable, varKeys[i]);
                    if (value === null || value === undefined) {
                        continue;
                    }
                    let newVariableName = varKeys[i];
                    let variableRef = pageVariable;
                    if (varKeys[i].indexOf('.') !== -1) {
                        newVariableName = varKeys[i].substring(varKeys[i].lastIndexOf('.') + 1);
                        variableRef = Render._getValueFromJsonPath(pageVariable, varKeys[i].substring(0, varKeys[i].indexOf('.')));
                    }
                    variable[newVariableName] = value;
                    variableMapping.push({
                        variableRef,
                        variableKey: newVariableName,
                        variableKeyInComponent: newVariableName
                    });
                }

                const attrs = el.getAttributeNames();
                for (let i = 0; i < attrs.length; i++) {
                    const attrName = attrs[i];
                    if (attrName.indexOf('attr-') === -1 && attrName.indexOf('bind-') === -1) {
                        continue;
                    }
                    const attrValue = el.getAttribute(attrName);
                    const attrPrefix = attrName.substring(0, attrName.indexOf('-'));
                    const variableNameInComponent = Render.sankeToCamel(attrName.replace(/bind-/gi, '').replace(/attr-/gi, ''));

                    if (attrPrefix === 'bind') {
                        let value = pageVariable[attrValue] || '';
                        let variableRef = pageVariable;
                        if (attrValue.indexOf('.') !== -1) {
                            value = Render._getValueFromJsonPath(pageVariable, attrValue);
                            variableRef = Render._getValueFromJsonPath(pageVariable, attrValue.substring(0, attrValue.indexOf('.')));
                        }
                        const newVariableName = attrValue;
                        variable[variableNameInComponent] = value;
                        variableMapping.push({
                            variableRef: variableRef,
                            variableKey: newVariableName.lastIndexOf('.') !== -1 ? newVariableName.substring(newVariableName.lastIndexOf('.') + 1) : newVariableName,
                            variableKeyInComponent: variableNameInComponent
                        });
                    } else if (attrPrefix === 'attr') {
                        variable[variableNameInComponent] = attrValue;
                    }
                }

                let ComponentClass;
                try {
                    if (window.SwimAppComponents && window.SwimAppComponents[componentInfo.moduleName]) {
                        ComponentClass = window.SwimAppComponents[componentInfo.moduleName];
                    } else {
                        const loader = new Loader();
                        ComponentClass = await loader.loadJS(componentInfo.url, componentInfo.moduleName);
                    }
                } catch (error) {
                    console.error(`${componentInfo.moduleName} module name wrong`);
                }

                const componentInstance = new ComponentClass(el, variable, args);
                for (let i = 0; i < variableMapping.length; i++) {
                    Render.registComponentToVariable(variableMapping[i].variableRef, variableMapping[i].variableKey, componentInstance, variableMapping[i].variableKeyInComponent);
                }
                await componentInstance.render();
                // binding event;
                el.getAttributeNames().forEach((attrName) => {
                    if (attrName.indexOf('on-') === 0) {
                        const funcName = el.getAttribute(attrName).replace(/controller\./gi, '');
                        if (controller[funcName]) {
                            componentInstance.elHTML.addEventListener(attrName.replace(/^on-/gi, ''), (e) => {
                                controller[funcName](e);
                            });
                        }
                    }
                });
                if (componentInstance.postRender) {
                    await componentInstance.postRender();
                }
            }
        }
    },
    bindingVariableToDom: (controller, elRoot, variable, args, computed) => {
        Render._renderSwimFor(elRoot, variable, controller, args, computed);
        Render._bindingVariableAndWatch(elRoot, variable, computed);
    },
    registElementToVariable (variable, propertyName, element, type, originalTemplate) {
        const variableBindingElementsKey = Render._getBindingElementsKey(propertyName);
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
    registComponentToVariable (variable, variableName, componentInstance, variableNameInComponent) {
        const variableBindingComponentKey = Render._getBindingComponentsKey(variableName);
        if (!variable[variableBindingComponentKey]) {
            variable[variableBindingComponentKey] = [];
        }
        const target = variable[variableBindingComponentKey].find((item) => {
            return item.ref === componentInstance;
        });
        if (!target) {
            variable[variableBindingComponentKey].push({
                ref: componentInstance,
                variableName: variableNameInComponent
            });
        }
    },
    appendStylesheetToHeadAndRemoveLoaded (htmlString) {
        const stylesheetTags = Render._extractStyleLinkTags(htmlString);
        for (let i = 0; i < stylesheetTags.length; i++) {
            const stylesheetHref = this._extractStyleSheetHref(stylesheetTags[i]);
            if (window.SwimAppStylesheet.indexOf(stylesheetHref) !== -1) {
                htmlString = htmlString.replace(stylesheetTags[i], '');
            } else {
                const elLink = document.createElement('link');
                elLink.rel = ' stylesheet';
                elLink.href = stylesheetHref;
                document.head.appendChild(elLink);
                window.SwimAppStylesheet.push(stylesheetHref);
            }
        }
        return htmlString;
    },
    _getValueFromJsonPath (jsonData, path) {
        if (!(jsonData instanceof Object) || typeof (path) === 'undefined') {
            throw new Error('Not valid argument:jsonData:' + jsonData + ', path:' + path);
        }
        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        path = path.replace(/^\./, ''); // strip a leading dot
        const pathArray = path.split('.');
        for (let i = 0, n = pathArray.length; i < n; ++i) {
            const key = pathArray[i];
            if (key in jsonData) {
                if (jsonData[key] !== null) {
                    jsonData = jsonData[key];
                } else {
                    return null;
                }
            } else {
                return key;
            }
        }
        return jsonData;
    },
    _extractStyleLinkTags (htmlString) {
        const result = [];
        let currentPosistion = 0;
        let start, end;
        while (htmlString.indexOf('<link', currentPosistion) !== -1) {
            start = htmlString.indexOf('<link', currentPosistion);
            end = htmlString.indexOf('>', start + 1);
            const linkTagString = htmlString.substring(start, end + 1);
            if (linkTagString.indexOf('rel="stylesheet"') !== -1 || linkTagString.indexOf('rel=stylesheet') !== -1) {
                result.push(linkTagString);
            }
            currentPosistion = end + 1;
        }
        return result;
    },
    _extractStyleSheetHref (linkTagString) {
        const hrefStartPos = linkTagString.indexOf('href');
        const hrefQuoteStartPos = linkTagString.indexOf('"', hrefStartPos + 1);
        const hrefQuoteEndPos = linkTagString.indexOf('"', hrefQuoteStartPos + 1);
        if (hrefQuoteStartPos !== -1) {
            return linkTagString.substring(hrefQuoteStartPos + 1, hrefQuoteEndPos).replace(location.origin, '');
        } else {
            // somebody's html look like <div class=active> no quote, below code will resolve this situation
            const hrefEqualEndPos = linkTagString.indexOf('=', hrefStartPos);
            const hrefBlankStartPos = linkTagString.indexOf(' ', hrefEqualEndPos);
            return linkTagString.substring(hrefEqualEndPos + 1, hrefBlankStartPos);
        }
    },
    _renderSwimFor: (elRoot, variable, controller, args, computed) => {
        for (const propertyName in variable) {
            if (!Array.isArray(variable[propertyName])) {
                continue;
            }
            const loopRenderContainers = [];
            elRoot.querySelectorAll(`[swim-for="${propertyName}"],[swim-for$="in ${propertyName}"]`).forEach((elContainer) => {
                loopRenderContainers.push(elContainer);
                const swimForAttribute = elContainer.getAttribute('swim-for');
                const nextLevelKey = swimForAttribute.indexOf(` in ${propertyName}`) !== -1 ? swimForAttribute.replace(` in ${propertyName}`, '') : null;
                Render._renderSwimForMain(elContainer, variable[propertyName], controller, args, nextLevelKey, computed);
            });

            let timer = null;
            if (loopRenderContainers.length > 0) {
                variable[propertyName].push = (item) => {
                    Array.prototype.push.apply(variable[propertyName], [item]);
                    clearTimeout(timer);
                    timer = setTimeout(async () => {
                        for (let i = 0; i < loopRenderContainers.length; i++) {
                            const swimForAttribute = loopRenderContainers[0].getAttribute('swim-for');
                            const nextLevelKey = swimForAttribute.indexOf(` in ${propertyName}`) !== -1 ? swimForAttribute.replace(` in ${propertyName}`, '') : null;
                            Render._renderSwimForMain(loopRenderContainers[i], variable[propertyName], controller, args, nextLevelKey, computed);
                            Render.bindingVariableToDom(controller, loopRenderContainers[i], variable, args, computed);
                            Render.bindingEvent(loopRenderContainers[i], controller);
                            await Render.renderComponentAsync(loopRenderContainers[i], variable, args, controller);
                        }
                    });
                    return variable[propertyName];
                };

                variable[propertyName].unshift = (item) => {
                    Array.prototype.unshift.apply(variable[propertyName], [item]);
                    clearTimeout(timer);
                    timer = setTimeout(async () => {
                        for (let i = 0; i < loopRenderContainers.length; i++) {
                            const swimForAttribute = loopRenderContainers[0].getAttribute('swim-for');
                            const nextLevelKey = swimForAttribute.indexOf(` in ${propertyName}`) !== -1 ? swimForAttribute.replace(` in ${propertyName}`, '') : null;
                            Render._renderSwimForMain(loopRenderContainers[i], variable[propertyName], controller, args, nextLevelKey, computed);
                            Render.bindingVariableToDom(controller, loopRenderContainers[i], variable, args, computed);
                            Render.bindingEvent(loopRenderContainers[i], controller);
                            await Render.renderComponentAsync(loopRenderContainers[i], variable, args, controller);
                        }
                    });
                    return variable[propertyName];
                };

                variable[propertyName].splice = (index, number) => {
                    const result = Array.prototype.splice.apply(variable[propertyName], [index, number]);
                    clearTimeout(timer);
                    timer = setTimeout(async () => {
                        for (let i = 0; i < loopRenderContainers.length; i++) {
                            const swimForAttribute = loopRenderContainers[0].getAttribute('swim-for');
                            const nextLevelKey = swimForAttribute.indexOf(` in ${propertyName}`) !== -1 ? swimForAttribute.replace(` in ${propertyName}`, '') : null;
                            Render._renderSwimForMain(loopRenderContainers[i], variable[propertyName], controller, args, nextLevelKey, computed);
                            Render.bindingVariableToDom(controller, loopRenderContainers[i], variable, args, computed);
                            Render.bindingEvent(loopRenderContainers[i], controller);
                            await Render.renderComponentAsync(loopRenderContainers[i], variable, args, controller);
                        }
                    });
                    return result;
                };

                variable[propertyName].sort = (sortFunc) => {
                    const result = Array.prototype.sort.apply(variable[propertyName], [sortFunc]);
                    clearTimeout(timer);
                    timer = setTimeout(async () => {
                        for (let i = 0; i < loopRenderContainers.length; i++) {
                            const swimForAttribute = loopRenderContainers[0].getAttribute('swim-for');
                            const nextLevelKey = swimForAttribute.indexOf(` in ${propertyName}`) !== -1 ? swimForAttribute.replace(` in ${propertyName}`, '') : null;
                            Render._renderSwimForMain(loopRenderContainers[i], variable[propertyName], controller, args, nextLevelKey, computed);
                            Render.bindingVariableToDom(controller, loopRenderContainers[i], variable, args, computed);
                            Render.bindingEvent(loopRenderContainers[i], controller);
                            await Render.renderComponentAsync(loopRenderContainers[i], variable, args, controller);
                        }
                    });
                    return result;
                };
            }
        }
    },
    _renderSwimForMain: async (elContainer, variable, controller, args, nextLevelKey, computed) => {
        if (Array.isArray(variable)) {
            const itemTemplate = elContainer.template || elContainer.innerHTML;
            elContainer.template = itemTemplate;
            elContainer.innerHTML = '';
            for (let i = 0; i < variable.length; i++) {
                const elItem = itemTemplate.toDom();
                if (nextLevelKey) {
                    Render._renderSwimForMain(elItem.querySelector(`[swim-for$="in ${nextLevelKey}"]`), variable[i], controller, args, null, computed);
                }
                if (elContainer.getAttribute('swim-for').indexOf(' in ') !== -1) {
                    const variableAs = elContainer.getAttribute('swim-for').split(' in ')[0];
                    const replacement = new RegExp(variableAs, 'g');
                    // replace component attribute;
                    elItem.querySelectorAll('*').forEach(async (el) => {
                        if (el && (el.tagName.toLowerCase().indexOf('component-') !== -1 || el.hasAttribute('swim-for'))) {
                            let newVariableAttribute = null;
                            const attrNames = el.getAttributeNames();
                            for (let j = 0; j < attrNames.length; j++) {
                                if (attrNames[j] === 'class') {
                                    continue;
                                }
                                newVariableAttribute = el.getAttribute(attrNames[j]).replace(replacement, `${elContainer.getAttribute('swim-for').split(' in ')[1]}[${i}]`);
                                el.setAttribute(attrNames[j], newVariableAttribute);
                            }
                        }
                    });
                    if (elItem.tagName.toLowerCase().indexOf('component-') !== -1) {
                        let newVariableAttribute = null;
                        const attrNames = elItem.getAttributeNames();
                        for (let j = 0; j < attrNames.length; j++) {
                            if (attrNames[j] === 'class') {
                                continue;
                            }
                            newVariableAttribute = elItem.getAttribute(attrNames[j]).replace(replacement, `${elContainer.getAttribute('swim-for').split(' in ')[1]}[${i}]`);
                            elItem.setAttribute(attrNames[j], newVariableAttribute);
                        }
                    }
                }
                variable[i].index = i;
                variable[i].postiveIndex = i + 1;
                Render.bindingVariableToDom(controller, elItem, variable[i], args, computed);
                if (elContainer.tagName === 'SELECT' && elContainer.hasAttribute('value')) {
                    if (elItem.value === elContainer.getAttribute('value')) {
                        elItem.setAttribute('selected', '');
                    }
                }
                if (
                    (elContainer.tagName.toLowerCase() === 'tbody' && elItem.tagName.toLowerCase() === 'tbody')
                ) {
                    elItem.childNodes.forEach((item) => {
                        elContainer.appendChild(item);
                    });
                } else {
                    elContainer.appendChild(elItem);
                }
            }
        } else {
            console.warn('loop variable is not array');
        }
    },
    // todo: refactor duplicate code
    bindingEvent: (elRoot, controller) => {
        elRoot.querySelectorAll('[onmouseover^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onmouseover').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                if (controller[funcName]) {
                    el.addEventListener('mouseover', (e) => {
                        controller[funcName](e);
                    });
                    el.removeAttribute('onmouseover');
                }
            }
        });
        elRoot.querySelectorAll('[onload^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onload').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                if (controller[funcName]) {
                    el.addEventListener('load', (e) => {
                        controller[funcName](e);
                    });
                    el.removeAttribute('onload');
                }
            }
        });

        elRoot.querySelectorAll('[onmouseout^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onmouseout').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                if (controller[funcName]) {
                    el.addEventListener('mouseout', (e) => {
                        controller[funcName](e);
                    });
                    el.removeAttribute('onmouseout');
                }
            }
        });
        elRoot.querySelectorAll('[onclick^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onclick').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                if (controller[funcName]) {
                    el.addEventListener('click', (e) => {
                        controller[funcName](e);
                    });
                    el.removeAttribute('onclick');
                }
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

        elRoot.querySelectorAll('[onfocus^="controller."]').forEach((el) => {
            const stringOfFuncNames = el.getAttribute('onfocus').split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                el.addEventListener('focus', (e) => {
                    controller[funcName](e);
                });
                el.removeAttribute('onfocus');
            }
        });

        const onclickCallback = elRoot.getAttribute('onclick');
        if (onclickCallback && onclickCallback.indexOf('controller.') !== -1) {
            const stringOfFuncNames = onclickCallback.split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                elRoot.addEventListener('click', (e) => {
                    controller[funcName](e);
                });
                elRoot.removeAttribute('onclick');
            }
        }
        const onchangeCallback = elRoot.getAttribute('onchange');
        if (onchangeCallback && onchangeCallback.indexOf('controller.') !== -1) {
            const stringOfFuncNames = onchangeCallback.split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                elRoot.addEventListener('change', (e) => {
                    controller[funcName](e);
                });
                elRoot.removeAttribute('onchange');
            }
        }
        const onkeyupCallback = elRoot.getAttribute('onkeyup');
        if (onkeyupCallback && onkeyupCallback.indexOf('controller.') !== -1) {
            const stringOfFuncNames = onkeyupCallback.split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                elRoot.addEventListener('keyup', (e) => {
                    controller[funcName](e);
                });
                elRoot.removeAttribute('onkeyup');
            }
        }
        const onkeydownCallback = elRoot.getAttribute('onkeydown');
        if (onkeydownCallback && onkeydownCallback.indexOf('controller.') !== -1) {
            const stringOfFuncNames = onkeydownCallback.split(',');
            for (let i = 0; i < stringOfFuncNames.length; i++) {
                const funcName = stringOfFuncNames[i].replace('controller.', '');
                elRoot.addEventListener('keydown', (e) => {
                    controller[funcName](e);
                });
                elRoot.removeAttribute('onkeydown');
            }
        }
    },

    _getBindingElementsKey: (propertyName) => {
        return `__${propertyName}__elements`;
    },
    _getBindingComponentsKey: (propertyName) => {
        return `__${propertyName}__components`;
    },
    _getBindingElements (variable, propertyName) {
        const variableBindingElementsKey = Render._getBindingElementsKey(propertyName);
        return variable[variableBindingElementsKey];
    },

    _getBindingComponent (variable, propertyName) {
        const variableBindingComponentKey = Render._getBindingComponentsKey(propertyName);
        return variable[variableBindingComponentKey];
    },
    _refreshElementAttributeWithVariable (el, propertyName, newValue) {
        const attrNames = el.getAttributeNames();
        for (let j = 0; j < attrNames.length; j++) {
            const attrName = attrNames[j];
            let attrValue = el.originalAttribute[attrName];
            if (attrValue && attrValue.indexOf(`{${propertyName}}`) !== -1) {
                attrValue = attrValue.replace(`{${propertyName}}`, newValue);
                el.bindingAttributes[attrName][propertyName] = newValue;
                for (const key in el.bindingAttributes[attrName]) {
                    attrValue = attrValue.replace(`{${key}}`, el.bindingAttributes[attrName][key]);
                }
                if (el.tagName.toLowerCase() === 'input' && attrName === 'value') {
                    el.value = attrValue;
                }
                el.setAttribute(attrName, attrValue);
            }
        }
    },
    _bindingVariableAndWatch: (elRoot, variableObj, computed) => {
        const computedFields = computed;
        for (let i = 0; i < computedFields.length; i++) {
            variableObj[computedFields[i].variableName] = computedFields[i].value();
        }

        for (const propertyName in variableObj) {
            if (propertyName.indexOf('_') === 0) {
                continue;
            }
            variableObj[`_${propertyName}`] = variableObj[propertyName];
            variableObj[propertyName] = variableObj[`_${propertyName}`];
            const registResult = Object.defineProperty(variableObj, propertyName, {
                // refactor: debounce set
                set: (newValue) => {
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
                                if (bindingElements[i].ref instanceof Element || bindingElements[i].ref instanceof HTMLDocument) {
                                    Render._refreshElementAttributeWithVariable(bindingElements[i].ref, propertyName, newValue);
                                }
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

                    const watchComputedFields = computed.filter(item => item.watchKey === propertyName);
                    for (let i = 0; i < watchComputedFields.length; i++) {
                        variableObj[watchComputedFields[i].variableName] = watchComputedFields[i].value();
                    }

                    if (components) {
                        for (let i = 0; i < components.length; i++) {
                            components[i].ref.variable[components[i].variableName] = newValue;
                        }
                    }
                },
                get: () => {
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

        // first time replace html;
        for (const propertyName in variableObj) {
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
                const attrNames = element.getAttributeNames();

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
                if (el.parentElement.hasAttribute('unsafe-html') && el.parentElement.hasClass('has-binded')) {
                    el = query.iterateNext();
                    continue;
                }
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
                    if (el.parentElement.hasAttribute('unsafe-html')) {
                        el.parentElement.addClass('has-binded');
                        el.parentElement.innerHTML = variableObj[propertyName];
                    } else {
                        el.textContent = el.template.replace(`{${propertyName}}`, variableObj[propertyName]);
                    }
                }
            }
        }
    },
    _getComponentInfo: (tagName) => {
        const componentName = tagName.replace(/component-/gi, '');
        const componentUrl = `${APP_CONFIG.FRONT_END_PREFIX}/components/${componentName}/${componentName}.component.js`;
        const arrayComponentName = componentName.split('-');
        for (let i = 0; i < arrayComponentName.length; i++) {
            arrayComponentName[i] = arrayComponentName[i].substring(0, 1).toUpperCase() + arrayComponentName[i].substring(1);
        }
        const componentModuleName = arrayComponentName.join('') + 'Component';
        return {
            url: componentUrl,
            moduleName: componentModuleName
        };
    },
    sankeToCamel: (s) => {
        return s.replace(/([-_][a-z])/ig, ($1) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '');
        });
    }
};
