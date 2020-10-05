const { InputField } = require('./input-field.js');

module.exports.InputFieldBoolean = class extends InputField{
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
                  title="${this.options.beschreibung}"
              >
              <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
          </div>
      `);
      this.querySelector('input').addEventListener('input', (event) => (console.log('checked', event), this.dispatchCustomEvent.bind(this, 'form-input')(event)))
  }

  getModel(){
      let model = this.querySelector(`#${this.options.name}`).checked;
      return model;
  }
}
