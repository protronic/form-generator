const { InputField } = require('./input-field.js');

module.exports.InputFieldRadio = class extends InputField {
    constructor(){
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            abwahlButtonLabel: 'Auswahl aufheben',
            items: []
        }
    }
    
    radioButtonClearHandler(event){
        let self = event.target.parentElement.parentElement;
        self.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false)
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
                    <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
                </form>
            </div>
        `);
        this.querySelector('button.clear-radio-btn').addEventListener('click', this.radioButtonClearHandler);
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
