class InputField extends HTMLElement {
    schema = {};
    template = '';
    defaultOptions = {
        name: '',
        label: '',
        standard: '',
        deaktiviert: false,
        pflichtfeld: false,
    };
    options = {};

    constructor(){
        super();
    }

    connectedCallback(){
        Object.keys(this.defaultOptions).forEach(key => {
            // console.log(key, this.getAttribute(key) || this.defaultOptions[key])
            this.options[key] = this.convertValue(key, this.getAttribute(key)) || this.defaultOptions[key];
        })
        this.applyTemplate();
    }

    applyTemplate(){
        throw Error('Not Implemented');
    }

    convertValue(key, value){
        return JSON.parse(value);
    }

    saveValue(key, value){
        return JSON.stringify(value);
    }

    getModel(){
        throw Error('Not Implemented');
    }
}

class GenericInputField extends InputField{
    constructor(inputType){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            platzhalter: '',
            muster: '.*',
            inputType: inputType
        };
    }

    applyTemplate(){
        this.innerHTML = `
            <div class="form-element">
                <label for="${this.options.name}">${this.options.label}</label>
                <input 
                    id="${this.options.name}" 
                    placeholder="${this.options.platzhalter}" 
                    value="${this.options.standard}" 
                    pattern="${this.options.muster}" 
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    type="${this.options.inputType}" 
                >
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `;
    }

    getModel(){
        let model = this.querySelector(`#${this.options.name}`).value;
        console.log(this.options.name, model)
        return model;
    }
}

class InputFieldText extends GenericInputField{
    constructor(){
        super('text');
    }
}

customElements.define('input-field-text', InputFieldText);

class InputFieldEmail extends GenericInputField{
    constructor(){
        super('email');
    }
}

customElements.define('input-field-email', InputFieldEmail);

class InputFieldTel extends GenericInputField{
    constructor(){
        super('tel');
    }
}

customElements.define('input-field-tel', InputFieldTel);

class InputFieldTextarea extends GenericInputField{
    constructor(){
        super('textarea');
    }
}

customElements.define('input-field-textarea', InputFieldTextarea);



class InputFieldDropdown extends InputField {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            items: []
        }
    }

    applyTemplate(){
        this.innerHTML = `
        <div class="form-element">
            <label for="${this.options.name}">${this.options.label}</label>
            <select 
                id="${this.options.name}" 
                ${this.options.deaktiviert ? 'disabled' : ''}
            >
                
                ${this.options.items.map(item => `<option value="${item}" ${this.options.standard === item ? 'selected' : ''}>${item}</option>`).join('/n')}
            </select>
            <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
        </div>
        `;
    }

    getModel(){
        let model = this.querySelector('select').value;
        console.log(this.options.name, model);
        return model;
    }
}

customElements.define('input-field-dropdown', InputFieldDropdown);

function collapseObjectGroup(event){
    let collapseBtn = event.srcElement;
    let self = collapseBtn.parentElement.parentElement;
    console.log(collapseBtn, self)
    if(!self.collapsed){
        collapseBtn.nextElementSibling.classList.add("hidden");
        collapseBtn.innerText = 'ausklappen';
        self.collapsed = !self.collapsed;
    } else {
        collapseBtn.nextElementSibling.classList.remove("hidden");
        collapseBtn.innerText = 'einklappen';
        self.collapsed = !self.collapsed;
    }
}

class InputFieldObject extends InputField{
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            subform: {}
        };
        this.collapsed = false;
    }

    applyTemplate(){
        this.innerHTML = `
        <div class="form-element">
            <label for="${this.options.name}">${this.options.label}</label><button class="form-object-collapse" type="button" onclick="collapseObjectGroup(event)">einklappen</button>
            <div id="${this.options.name}" class="form-group">
                ${Object.keys(this.options.subform).map(key => {
                    let sub = this.options.subform[key];
                    let result = `<${sub.feldtyp} ${Object.keys(sub).map(key => `${key}='${this.saveValue(key, sub[key])}'`).join(' ')}></${sub.feldtyp}>`;
                    return result;
                }).join('\n')}
            </div>
        </div>
        `;
    }

    getModel(){
        let model = {};
        for(let objProps of this.querySelector(`#${this.options.name}`).children) {
            console.log(objProps)
            model[objProps.getAttribute('name')] = objProps.getModel();
        }
        console.log(this.options.name, model);
    }
}

customElements.define('input-field-object', InputFieldObject);


class InputFieldRadio extends InputField {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            items: []
        }
    }

    applyTemplate(){
        this.innerHTML = `
        <div class="form-element">
            <label for="${this.options.name}">${this.options.label}</label>
            <div id="${this.options.name}" class="form-radio-group">
                ${this.options.items.map(item => {
                    return `
                            <input type="radio" id="${this.options.name}-${item}" name="${this.options.name}" value="${item}" ${this.options.standard === item ? 'checked' : ''}>
                            <label for="${this.options.name}-${item}">${item}</label>
                        `;
                }).join('<br>')}
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        </div>
        `;
    }

    getModel(){
        let model = undefined;
        this.querySelectorAll('input').forEach(inputElement => {
            if(inputElement.hasAttribute('checked')){
                model = inputElement.value;
            }
        })
        console.log(this.options.name, model);
        return model;
    }
}

customElements.define('input-field-radio', InputFieldRadio);


class InputFieldDate extends InputField{
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            standard: (new Date()).toLocaleDateString('en-CA'),
            min: undefined,
            max: undefined
        };
    }

    applyTemplate(){
        this.innerHTML = `
            <div class="form-element">
                <label for="${this.options.name}">${this.options.label}</label>
                <input 
                    id="${this.options.name}" 
                    value="${this.options.standard}" 
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    type="date" 
                >
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `;
    }

    getModel(){
        let model = this.querySelector('input[checked]') ? this.querySelector('input[checked]').value : null;
        console.log(this.options.name, model);
        return model;
    }
}

customElements.define('input-field-date', InputFieldDate);

class InputFieldBoolean extends InputField{
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            standard: false,
        };
    }

    applyTemplate(){
        this.innerHTML = `
            <div class="form-element">
                <label for="${this.options.name}">${this.options.label}</label>
                <input 
                    id="${this.options.name}" 
                    ${this.options.standard ? 'checked' : ''}
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    type="checkbox" 
                >
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `;
    }

    getModel(){
        let model = this.querySelector(`#${this.options.name}`).hasAttribute('checked');
        console.log(this.options.name, model);
        return model;
    }
}

customElements.define('input-field-boolean', InputFieldBoolean);

function addListItem(event){
    let self = event.srcElement.parentElement.parentElement; 


    let lfdNr = event.srcElement.previousElementSibling.childNodes.length ? 0 : event.srcElement.previousElementSibling.childNodes.length;

    let newEle = `
        ${self.options.vorlage.map(formElement => {
            return `<${formElement.feldtyp} ${Object.keys(formElement).map(key => `${key}='${self.saveValue(key, formElement[key], lfdNr)}'`).join(' ')}></${formElement.feldtyp}>`
        }).join('\n')}
        <button class="form-list-removebtn" onclick="(function(event){event.srcElement.previousElementSibling.remove(); event.srcElement.remove()})(event)" type="button">${self.options.entfernenLabel}</button>
    `;

    event.srcElement.previousElementSibling.innerHTML += newEle;
}

class InputFieldList extends InputField {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            vorlage: [],
            hinzufügenLabel: '+',
            entfernenLabel: '-'
        };
    }

    applyTemplate(){
        this.innerHTML = `
            <div class="form-element">
                <label for="${this.options.name}">${this.options.label}</label><br>
                <div class="form-list" id="${this.options.name}" ${this.options.deaktiviert ? 'disabled' : ''}>

                </div>
                <button id="${this.options.name}-button" type="button" class="form-list-addbtn" onclick="addListItem(event)">${this.options.hinzufügenLabel}</button>
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>

        `;
    }

    saveValue(key, value, index){
        if(key === 'name'){
            console.log(JSON.stringify(`${value}-${index}`))
            return JSON.stringify(`${value}-${index}`);
        } else {
            return JSON.stringify(value);
        }
    }

    getModel(){
        let model = [];
        this.querySelectorAll(`#${this.options.name} > :not(button)`).forEach(listEle => {
            model += [listEle.getModel()];
        });
        console.log(this.options.name, model);
        return model;
    }
}

customElements.define('input-field-list', InputFieldList);
