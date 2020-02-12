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
        return value;
    }
}

class InputFieldText extends InputField{
    
    
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            platzhalter: '',
            muster: '.*'
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
                    type="text" 
                >
                <span class="pflichtfeld" style="font-style: italic;" style="visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
            </div>
        `;
    }
}

customElements.define('input-field-text', InputFieldText);

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
            <span class="pflichtfeld" style="font-style: italic;" style="visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
        </div>
        `;
    }

    convertValue(key, value){
        if(key === 'items'){
            return value.trim().slice(1, -1).split(',').map(item => item.trim());
        } else {
            return super.convertValue(key, value);
        }
    }
}

customElements.define('input-field-dropdown', InputFieldDropdown);

class InputFieldObject extends InputField{
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            subform: {}
        }
    }

    applyTemplate(){
        let saveValue = (key, value) => key === 'subform' ? JSON.stringify(value) : value;

        this.innerHTML = `
        <div class="form-element">
            <label for="${this.options.name}">${this.options.label}</label>
            <div class="form-group">
                ${Object.keys(this.options.subform).map(key => {
                    let sub = this.options.subform[key];
                    let result = `<${sub.feldtyp} ${Object.keys(sub).map(key => `${key}="${saveValue(key, sub[key])}"`).join(' ')}></${sub.feldtyp}>`;
                    return result;
                }).join('\n')}
            </div>
        </div>
        `;
    }

    convertValue(key, value){
        if(key === 'subform'){
            return JSON.parse(value);
        } else {
            return super.convertValue(key, value);
        }
    }    
}

customElements.define('input-field-object', InputFieldObject);