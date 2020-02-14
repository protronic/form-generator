function radioButtonChange(event, value){

    let self = event.srcElement.parentElement.parentElement;
    console.log(self)
    console.log(value)

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
            <label for="${this.options.name}">${this.options.label}</label>
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
        console.log(this.options.name, model);
        return model;
    }
}

customElements.define('input-field-radio', InputFieldRadio);