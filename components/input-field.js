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
    model = {};
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
        console.log(key, value);
        return JSON.parse(value);
    }

    saveValue(key, value){
        if(key === 'query') value = value.split("'").join("&#39;");
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
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
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

class InputFieldTextarea extends InputField{
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            platzhalter: '',
            cols: 50,
            rows: 5,
            wrap: 'soft'
        };
    }

    applyTemplate(){
        this.innerHTML = `
            <div class="form-element">
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <textarea 
                    id="${this.options.name}" 
                    placeholder="${this.options.platzhalter}" 
                    value="${this.options.standard}" 
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    cols="${this.options.cols}"
                    rows="${this.options.rows}"
                    wrap="${this.options.wrap}"
                ></textarea>
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `;
    }

    getModel(){
        let model = this.querySelector(`#${this.options.name}`).value;
        return model;
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
            ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
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
        return model;
    }
}

customElements.define('input-field-dropdown', InputFieldDropdown);

function collapseObjectGroup(event){
    let collapseBtn = event.srcElement;
    let self = collapseBtn.parentElement.parentElement;
    let collapseEle = self.querySelector(`#${self.options.name}`)
    if(!self.collapsed){
        collapseEle.classList.add("hidden");
        collapseBtn.innerText = 'ausklappen';
        self.collapsed = !self.collapsed;
    } else {
        collapseEle.classList.remove("hidden");
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
            <button class="form-object-collapse" type="button" onclick="collapseObjectGroup(event)">einklappen</button>
            ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
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
            let partialModel = objProps.getModel();
            if(partialModel)
                model[JSON.parse(objProps.getAttribute('name'))] = partialModel;
        }
        if(Object.keys(model).length === 0)
            return undefined;
        else
            return model;
    }
}

customElements.define('input-field-object', InputFieldObject);


function radioButtonChange(event, value){

    let self = event.srcElement.parentElement.parentElement;
    self.currentValue = value;
}

class InputFieldRadio extends InputField {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            items: []
        }
        this.currentValue = ''
    }

    applyTemplate(){
        this.innerHTML = `
        <div class="form-element">
            ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
            <form name="${this.options.name}-radio" id="${this.options.name}" class="form-radio-group"><br>
                ${this.options.items.map(item => {
                    return `
                            <input type="radio" id="${this.options.name}-${item}" name="${this.options.name}" value="${item}" ${this.options.standard === item ? 'checked' : ''} onchange="radioButtonChange(event, '${item}')">
                            <label for="${this.options.name}-${item}">${item}</label>
                        `;
                }).join('<br>')}
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </form>
        </div>
        `;
    }

    getModel(){
        let model = this.currentValue;
        this.querySelectorAll('input').forEach(inputElement => {
            if(inputElement.hasAttribute('checked')){
                model = inputElement.value;
            }
        })
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
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
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
        let model = this.querySelector('input').value;  
        return model;
    }
}

customElements.define('input-field-date', InputFieldDate);

function checkboxChangeListener(event, changedValue){
    
    console.log(event)
    console.log(changedValue)
}

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
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <input  
                    id="${this.options.name}" 
                    ${this.options.standard ? 'checked' : ''}
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    type="checkbox" 
                    onchange="checkboxChangeListener(event, '${this.options.name}')"
                >
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `;
    }

    getModel(){
        let model = this.querySelector(`#${this.options.name}`).hasAttribute('checked');
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

    event.srcElement.previousElementSibling.insertAdjacentHTML('beforeend', newEle);
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
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
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
            model.push(listEle.getModel());
        });
        if(model.length === 0)
            return undefined
        else
            return model;
    }
}

customElements.define('input-field-list', InputFieldList);

function genericQuery(input, query, db){
    let uri = 'http://prot-subuntu:8081/master';

    return fetch(uri,  {
        method: 'POST',
        body: JSON.stringify({q: query.split('?').join(`${input}`)}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => data.recordset);
}

class InputFieldNachschlagen extends InputFieldText {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            ausgabeLabel: '',
            query: undefined,
            maxZeilen: 1
        }   
    }
    
    connectedCallback(){
        super.connectedCallback();
        console.log('test')
        let input = this.querySelector('input');

        input.addEventListener('input', (event) => {
            if(event.target.validity.valid && event.target.value !== ''){
                genericQuery(input.value, this.options.query)
                    .then(data => data.map(entry => Object.keys(entry).map(key => `${key}: ${entry[key]}`).join('<br>')))
                    .then(data => {
                        if(data[0]) {
                            this.querySelector('.test-display').innerHTML = data[0];
                            this.valid = true;
                        } else {
                            this.valid = false;
                        }
                    })
            } else {
                this.querySelector('.test-display').innerText = ''
                this.valid = false;
            }
        })
        input.insertAdjacentHTML('afterend', `
            <br><span class="test-display"></span>
        `)
    }
}

customElements.define('input-field-nachschlagen', InputFieldNachschlagen);