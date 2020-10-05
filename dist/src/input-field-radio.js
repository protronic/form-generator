const { InputField } = require('./input-field.js');

module.exports.InputFieldRadio = class extends InputField {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            abwahlButtonLabel: 'Auswahl aufheben',
            items: []
        }
        this.classList.add('radio-form');
    }
    
    radioButtonClearHandler(event){
        let self = event.target.parentElement.parentElement;
        self.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
        self.dispatchCustomEvent('form-input', event)
    }

    applyTemplate(){
        this.rootElement.insertAdjacentHTML('beforeend', `
            <div class="form-element">
                <button type="button" class="clear-radio-btn" tabIndex="-1" >${this.options.abwahlButtonLabel}</button>
                ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label>` : ''}
                <form name="${this.options.name}-radio" id="${this.options.name}" class="form-radio-group"><br>
                    ${this.options.items.map(item => {
                        return `
                                <input type="radio" id="${this.options.name}-${item}" name="${this.options.name}" value="${item}" ${this.options.initialModel === item ? 'checked' : ''}>
                                <label for="${this.options.name}-${item}">${item}</label>
                            `;
                    }).join('<br>')}
                    <span class="validity-message"></span>
                    <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
                </form>
            </div>
        `);
        this.querySelector('button.clear-radio-btn').addEventListener('click', this.radioButtonClearHandler);
        this.querySelectorAll('input').forEach(input => input.addEventListener('input', this.dispatchCustomEvent.bind(this, 'form-input')))
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

    checkValidity(){
        if(!this.getModel() && this.options.pflichtfeld) {
            this.setValidityStatus(false, 'Dies ist ein Pflichtfeld.', false);
            return false;
        }
        else {
            this.setValidityStatus(true, '', false);
            return true
        };
    }
}
