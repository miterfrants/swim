const extendStringProtoType = () => {
    if (!String.prototype.bind) {
        String.prototype.bind = function (variable) {
            var result = this.toString();
            for (var key in variable) {
                var reg = new RegExp('{' + key + '}', 'gi');
                if (typeof variable[key] !== 'string' && typeof variable[key] !== 'number' && typeof variable[key] !== 'boolean') {
                    result = result.replace(reg, '');
                    continue;
                }
                if (variable[key] == null || variable[key] == undefined) {
                    result = result.replace(reg, '');
                    continue;
                }
                result = result.replace(reg, variable[key]);
            }
            return result;
        };
    }

    if (!String.prototype.toDom) {
        String.prototype.toDom = function () {
            let tempContainer;
            if (this.trim().indexOf('<tr') === 0) {
                tempContainer = document.createElement('table');
                const tempTableBody = document.createElement('tbody');
                tempContainer.appendChild(tempTableBody);
                tempTableBody.innerHTML = this.toString().trim();

                if (tempContainer.childNodes.length > 1) {
                    console.warn('please make sure your html string only one root html element;');
                }
                return tempTableBody.childNodes[0];
            } else {
                tempContainer = document.createElement('div');
                tempContainer.innerHTML = this.toString().trim();
                if (tempContainer.childNodes.length > 1) {
                    console.warn('please make sure your html string only one root html element;');
                }
                return tempContainer.childNodes[0];
            }
        };
    }
};

const extendHTMLElementProtoType = async () => {
    if (!HTMLElement.prototype.collectFormData) {
        HTMLElement.prototype.collectFormData = function (skipWithoutDataFieldInputWarn = false) {
            const result = {};
            let inputs = this.querySelectorAll('input[type="text"],input[type="password"],input[type="number"],input[type="hidden"]');
            inputs.forEach((el) => {
                if (!el.dataset.field && el.type !== 'file' && !skipWithoutDataFieldInputWarn) {
                    console.warn('element data-field not exists');
                }
                if (el.hasAttribute('allow-empty') && el.value === '') {
                    result[el.dataset.field] = el.value;
                } else if (el.hasAttribute('allow-null') && el.value === '') {
                    result[el.dataset.field] = null;
                } else if (el.hasAttribute('number') && el.value) {
                    result[el.dataset.field] = Number(el.value.replace(/,/gi, ''));
                } else if (el.value) {
                    result[el.dataset.field] = el.value;
                }
            });

            let checkboxs = this.querySelectorAll('input[type="checkbox"]:checked');
            checkboxs.forEach((el) => {
                if (!el.dataset.field && el.type !== 'file' && !skipWithoutDataFieldInputWarn) {
                    console.warn('element data-field not exists');
                }
                if (el.hasAttribute('allow-empty') && el.value === '') {
                    result[el.dataset.field] = [];
                } else if (el.hasAttribute('allow-null') && el.value === '') {
                    result[el.dataset.field] = null;
                } else if (el.value) {
                    if (!result[el.dataset.field]) {
                        result[el.dataset.field] = [];
                    }
                    result[el.dataset.field].push(el.value);
                }
            });

            let selects = this.querySelectorAll('select');
            selects.forEach((el) => {
                if (!el.dataset.field && el.type !== 'file' && !skipWithoutDataFieldInputWarn) {
                    console.warn('element data-field not exists');
                }

                if (el.hasAttribute('allow-empty') && el.value === '') {
                    result[el.dataset.field] = el.value;
                } else if (el.hasAttribute('allow-null') && el.value === '') {
                    result[el.dataset.field] = null;
                } else if (el.value) {
                    result[el.dataset.field] = el.value;
                }
            });
            return result;
        };
    }

    if (!HTMLElement.prototype.clearForm) {
        HTMLElement.prototype.clearForm = function () {
            let inputs = this.querySelectorAll('input');
            inputs.forEach((el) => {
                if (!el.hasAttribute('skip-clear')) {
                    el.value = '';
                }

            });

            let selectes = this.querySelectorAll('select');
            selectes.forEach((el) => {
                if (!el.hasAttribute('skip-clear')) {
                    el.value = '';
                }
            });
        };
    }

    if (!HTMLElement.prototype.hasClass) {
        HTMLElement.prototype.hasClass = function (className) {
            return this.className.split(' ').indexOf(className) !== -1;
        };
    }

    if (!HTMLElement.prototype.addClass) {
        HTMLElement.prototype.addClass = function (newClassName) {
            const classes = this.className.split(' ');
            if (classes.indexOf(newClassName) === -1) {
                classes.push(newClassName);
                this.className = classes.join(' ');
            }
        };
    }

    if (!HTMLElement.prototype.removeClass) {
        HTMLElement.prototype.removeClass = function (className) {
            const classes = this.className.split(' ');
            const index = classes.indexOf(className);
            if (index !== -1) {
                classes.splice(index, 1);
                this.className = classes.join(' ');
            }
        };
    }

    if (!HTMLElement.prototype.prepend) {
        HTMLElement.prototype.prepend = function (node) {
            this.insertBefore(node, this.childNodes[0]);
        };
    }
    if (!HTMLElement.prototype.recurisiveFindParentByClass) {
        HTMLElement.prototype.recurisiveFindParentByClass = function (className) {
            if (this.tagName.toLowerCase() === 'body') {
                return null;
            }
            if (this.parentElement.hasClass(className)) {
                return this.parentElement;
            } else {
                return this.parentElement.recurisiveFindParentByClass(className);
            }
        };
    }
};

export {
    extendHTMLElementProtoType,
    extendStringProtoType
};