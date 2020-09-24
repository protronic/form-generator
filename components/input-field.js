// const { fieldTypeMap } = require('./formular-components.js')
const { debounce } = require('lodash');

const fieldTypeMap = {
    'text': 'input-field-text',
    'enumtext': 'input-field-enumlisttext',
    'enumtextarea': 'input-field-enumlisttextarea',
    'dependentenumtextarea': 'input-field-dependentenumtextarea',
    'email': 'input-field-email',
    'tel': 'input-field-tel',
    'date': 'input-field-date',
    'number': 'input-field-number',
    'textarea': 'input-field-textarea',
    'boolean': 'input-field-boolean',
    'dropdown': 'input-field-dropdown',
    'radio': 'input-field-radio',
    'lookup': 'input-field-lookup',
    'dependenttext': 'input-field-abhaengig',
    'list': 'input-field-list',
    'object': 'input-field-object', 
    'choose': 'input-field-choose-list',
    'dependentchoose': 'input-field-dependent-choose-list',
    'infosummary': 'info-field-summary',
};

module.exports.InputField = class extends HTMLElement {
    
    constructor(){
        super();
        this.schema = {};
        this.template = '';
        this.defaultOptions = {
            initialModel: '',
            name: '',
            label: '',
            beschreibung: '',
            standard: '',
            deaktiviert: false,
            pflichtfeld: false,
            hintergrundFarbe: 'none',
            nomodel: false,
            nomodel_unique_id: ''
        };
        this.rootElement = this;
        this.options = {};
        this.model = {};
        this.valid = true;
        this.validityMessage = undefined;
        this.options.initialModel = this.options.nomodel 
            ? localStorage.getItem(`${this.options.nomodel_unique_id}|${this.options.name}`) 
            : this.options.initialModel;
        this.addEventListener('form-input', debounce(this.formInputHandler, 1000, {leading: false, trailing: true}));
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
            this.options.beschreibung = this.options.name;
        }

        this.applyTemplate();
        this.querySelector('.form-element').style.backgroundColor = this.options.hintergrundFarbe;
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
            console.error(err)
            console.log(key, value.toSource(), typeof value);
        }
    }

    saveValue(key, value){
        if(key === 'query' || key === 'listenQuery') value = value.split("'").join("&#39;");
        return JSON.stringify(value);
    }

    /**
     * 
     * @param {boolean} doneValidityCheck - pass false, when validity check continues after this call.
     */
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
        // if(valid) this.dispatchCustomEvent('form-valid', {target: this});
        // if(!valid) this.dispatchCustomEvent('form-invalid', {target: this});
        this.valid = valid;
        this.validityMessage = message;
        this.setAttribute('data-tooltip', message);

        let messageField = this.querySelector('.validity-message');

        if((!valid || warning) && messageField) messageField.innerText = message;

        if(valid){
            this.classList.remove('invalid');
            if(!warning) this.classList.remove('warning');
        } else {
            this.classList.add('invalid');
        }
        if(warning) this.classList.add('warning');
    }

    setModel(){
        throw Error('Not Implemented')
    }

    getModel(){
        throw Error('Not Implemented');
    }

    mapFieldType(fieldType){
        return fieldTypeMap[fieldType];
    }

    dispatchCustomEvent(eventName, event){
        // if(eventName === 'form-input') this.checkValidity(true);
        return this.dispatchEvent(new Event(eventName, {
            bubbles: true,
            target: this,
            value: this.getModel(),
        }));        
    }

    formInputHandler(event){
        // console.log(event)
        let valid = event.target.checkValidity();
        if(valid) {
            this.dispatchCustomEvent('form-valid', {target: this})

        }
        else this.dispatchCustomEvent('form-invalid', {target: this});
    }
}