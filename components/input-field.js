class InputField extends HTMLElement {
    schema = {};
    template = '';
    defaultOptions = {
        initialModel: '',
        name: '',
        label: '',
        beschreibung: '',
        standard: '',
        deaktiviert: false,
        pflichtfeld: false,
    };
    rootElement = this;
    options = {};
    model = {};
    valid = true;
    validityMessage = undefined;
    constructor(){
        super();

        this.addEventListener('focusout', this.checkValidity)
    }

    connectedCallback(){
        Object.keys(this.defaultOptions).forEach(key => {
            // console.log(key, this.getAttribute(key) || this.defaultOptions[key])

            // if(key === 'initialModel') console.log(this.getAttribute(key), typeof this.getAttribute(key));
            this.options[key] = this.convertValue(key, this.getAttribute(key)) || this.defaultOptions[key];
        });

        if(this.options.initialModel == undefined || this.options.initialModel == ''){
            this.options.initialModel = this.options.standard;
        }

        if(this.options.beschreibung === ''){
            this.options.beschreibung = this.options.label;
        }

        this.applyTemplate();
    }

    applyTemplate(){
        throw Error('Not Implemented');
    }

    convertValue(key, value){
        try{
            if(value != undefined)
                return JSON.parse(value);
            else 
                return '';
        } catch(err){
            console.log(key, value.toSource(), typeof value);
            console.error(err)
        }
    }

    saveValue(key, value){
        if(key === 'query') value = value.split("'").join("&#39;");
        return JSON.stringify(value);
    }

    checkValidity(){
        if (this.options.pflichtfeld && this.getModel() == undefined){
            this.setValidityStatus(false, 'Dies ist ein Pflichtfeld, und muss ausgefüllt werden.');
            return false;
        } else {
            this.setValidityStatus(true, '');
            return true;
        }
    }

    setValidityStatus(valid, message, warning){
        this.valid = valid;
        this.validityMessage = message;
        this.setAttribute('data-tooltip', message);

        if(valid){
            this.classList.remove('invalid', 'warning');
        } else {
            this.classList.add('invalid');
            if(warning) this.classList.add('warning');
        }
    }

    setModel(){
        throw Error('Not Implemented')
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
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <input 
                    id="${this.options.name}" 
                    placeholder="${this.options.platzhalter}" 
                    ${(this.options.initialModel) ? `value="${this.options.initialModel}"` : ''}
                    pattern="${this.options.muster}" 
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    type="${this.options.inputType}"
                    title="${this.options.beschreibung}"
                >
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `);
    }

    getModel(){
        let model = this.querySelector(`#${this.options.name}`).value;
        return model;
    }

    checkValidity(){
        let valid = super.checkValidity();
        let input = this.querySelector('input');
        let inputValidity = input.validity.valid;

        if(!inputValidity){
            this.setValidityStatus(false, input.validationMessage);
        } else {
            this.setValidityStatus(true, '');
        }

        return valid && inputValidity;
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
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <textarea 
                    id="${this.options.name}" 
                    placeholder="${this.options.platzhalter}"  
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    cols="${this.options.cols}"
                    rows="${this.options.rows}"
                    wrap="${this.options.wrap}"
                >${(this.options.initialModel) ? this.options.initialModel : ''}</textarea>
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `);
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
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <select 
                    id="${this.options.name}" 
                    ${this.options.deaktiviert ? 'disabled' : ''}
                >
                    
                    ${this.options.items.map(item => `<option value="${item}" ${this.options.initialModel === item ? 'selected' : ''}>${item}</option>`).join('/n')}
                </select>
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `);
    }

    getModel(){
        let model = this.querySelector('select').value;
        return model;
    }
}

customElements.define('input-field-dropdown', InputFieldDropdown);

/** evtl könnte es auch von InputFieldNachschlagen erben ... */
class InputFieldAbhaengig extends InputFieldText {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            abhaengigFeld: '',
            wertSichtbar: '',
            interval: 500,
            //wertUnsichtbar: '',  erstmal default hidden, bei bedarf, kann logik erweitert werden.
        }
        this.hideField();   
    }

    applyTemplate(){
        let checkDependence = (dependent, event) => {
            if(dependent.getModel() === this.options.wertSichtbar){
                this.showField();
            } else {
                this.hideField();
            }
        };

        super.applyTemplate();
        (() => {
            let dependent = this.parentElement.querySelector(`*[name='${this.saveValue('abhaengigFeld', this.options.abhaengigFeld)}']`);
            dependent.addEventListener('focusout', checkDependence.bind(this, dependent));
            setInterval(checkDependence.bind(this, dependent), this.options.interval);
        })();
        // setTimeout(() => {
        //     let dependent = this.parentElement.querySelector(`*[name='${this.saveValue('abhaengigFeld', this.options.abhaengigFeld)}']`);
        //     dependent.addEventListener('focusout', (event) => {
        //         if(dependent.getModel() === this.options.wertSichtbar){
        //             this.showField();
        //         } else {
        //             this.hideField();
        //         }
        //     })
        // }, 500);
        // requestAnimationFrame();
    }

    hideField(){
        this.visibility = false;
        this.classList.add('hidden');
    }

    showField(){
        this.visibility = true;
        this.classList.remove('hidden');
    }

    getModel(){
        if(this.visibility){
            return super.getModel();
        } else {
            return undefined;
        }
    }

    checkValidity(){
        if(this.visibility){
            return super.checkValidity();
        } else {
            return true;
        }
    }
}

customElements.define('input-field-abhaengig', InputFieldAbhaengig);


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
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                <button class="form-object-collapse" type="button" tabIndex="-1" onclick="collapseObjectGroup(event)">einklappen</button>
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <div id="${this.options.name}" class="form-group">
                    ${Object.keys(this.options.subform).map(key => {
                        let sub = this.options.subform[key];
                        let result = `
                            <${sub.feldtyp} 
                                ${Object.keys(sub).map(key => `${key}='${this.saveValue(key, sub[key])}'`).join(' ')}
                                ${this.options.initialModel && (this.options.initialModel[sub.name]) ?  `initialModel='${this.saveValue('initialModel', this.options.initialModel[sub.name])}'` : ''} 
                            ></${sub.feldtyp}>`;
                        return result;
                    }).join('\n')}
                </div>
            </div>
        `);
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

    checkValidity(){
        let valid = true;
        for(let objProps of this.querySelector(`#${this.options.name}`).children) {
            let partialValidity = objProps.checkValidity();
            valid = valid && partialValidity;
        }
        return valid;
    }
}

customElements.define('input-field-object', InputFieldObject);


function radioButtonClear(event){
    let self = event.target.parentElement.parentElement;
    self.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false)
}

class InputFieldRadio extends InputField {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            abwahlButtonLabel: 'Auswahl aufheben',
            items: []
        }
    }

    applyTemplate(){
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                <button type="button" class="clear-radio-btn" tabIndex="-1" onclick="radioButtonClear(event)">${this.options.abwahlButtonLabel}</button>
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <form name="${this.options.name}-radio" id="${this.options.name}" class="form-radio-group"><br>
                    ${this.options.items.map(item => {
                        return `
                                <input type="radio" id="${this.options.name}-${item}" name="${this.options.name}" value="${item}" ${this.options.initialModel === item ? 'checked' : ''}>
                                <label for="${this.options.name}-${item}">${item}</label>
                            `;
                    }).join('<br>')}
                    <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
                </form>
            </div>
        `);
    }

    getModel(){
        let model = undefined;
        this.querySelectorAll('input[type="radio"]').forEach(inputElement => {
            if(inputElement.checked){
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
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <input 
                    id="${this.options.name}" 
                    ${(this.options.initialModel != undefined) ? `value="${this.options.initialModel}"` : ''} 
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    type="date" 
                >
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `);
    }

    getModel(){
        let model = this.querySelector('input').value;  
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
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <input  
                    id="${this.options.name}" 
                    ${this.options.initialModel ? 'checked' : 'unchecked'}
                    ${this.options.deaktiviert ? 'disabled' : ''}
                    type="checkbox"
                >
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `);
    }

    getModel(){
        let model = this.querySelector(`#${this.options.name}`).checked;
        return model;
    }
}

customElements.define('input-field-boolean', InputFieldBoolean);

function addListItem(event){
    let self = event.srcElement.parentElement.parentElement; 
    let lfdNr = event.srcElement.previousElementSibling.childNodes.length ? 0 : event.srcElement.previousElementSibling.childNodes.length;
    let newEle = self.getElementTemplate('', lfdNr);

    event.srcElement.previousElementSibling.insertAdjacentHTML('beforeend', newEle);
}

class InputFieldList extends InputField {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            standard: [],
            vorlage: [],
            hinzufügenLabel: '+',
            entfernenLabel: '-'
        };
    }

    applyTemplate(){
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                <div class="form-list" id="${this.options.name}" ${this.options.deaktiviert ? 'disabled' : ''}>
                    ${(this.options.initialModel.length > 0) ? this.options.initialModel.map((listItem, lfdNr) => {
                        return this.getElementTemplate(listItem, lfdNr)
                    }).join('\n') : ''}
                </div>
                <button id="${this.options.name}-button" type="button" class="form-list-addbtn" onclick="addListItem(event)">${this.options.hinzufügenLabel}</button>
                <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `);
    }

    getElementTemplate(listItem, lfdNr){
        return `
            ${this.options.vorlage.map(formElement => `
                <${formElement.feldtyp} 
                    ${Object.keys(formElement).map(key => `${key}='${this.saveValue(key, formElement[key], lfdNr)}'`).join(' ')}
                    initialModel='${this.saveValue('initialModel', listItem)}'
                ></${formElement.feldtyp}>
            `).join('\n')}
            <button class="form-list-removebtn" tabIndex="-1" onclick="(function(event){event.srcElement.previousElementSibling.remove(); event.srcElement.remove()})(event)" type="button">${this.options.entfernenLabel}</button>
        `;
    }

    saveValue(key, value, index){
        if(key === 'name'){
            // console.log(JSON.stringify(`${value}-${index}`))
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

    checkValidity(){
        let valid = true;

        this.querySelectorAll(`#${this.options.name} > :not(button)`).forEach(listEle => {
            valid = valid && listEle.checkValidity();
        })

        return valid;
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

    databaseLookup(input, event){
        if(event.target.validity.valid && event.target.value !== ''){
            genericQuery(input.value, this.options.query)
                .then(data => data.map(entry => Object.keys(entry).map(key => `${key}: ${entry[key]}`).join('<br>')))
                .then(data => {
                    if(data[0]) {
                        this.querySelector('.input-display').innerHTML = data[0];
                        this.valid = true;
                        this.setValidityStatus(true, '');
                    } else {
                        this.valid = false;
                        this.setValidityStatus(false, 'Datenbank hat kein passendes Ergebniss zurück geliefert.', true)
                    }
                })
        } else {
            this.querySelector('.input-display').innerText = ''
            this.valid = false;
        }
    }
    
    connectedCallback(){
        super.connectedCallback();
        let input = this.querySelector('input');

        input.addEventListener('input', this.databaseLookup.bind(this, input))
        console.log(this.options.initialModel)
        if(this.options.initialModel) this.databaseLookup(input, {target: input});
        input.insertAdjacentHTML('afterend', `
            <br><span class="input-display"></span>
        `)
    }
}

customElements.define('input-field-nachschlagen', InputFieldNachschlagen);