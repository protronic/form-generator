const { InputField } = require('./input-field.js');

module.exports.InputFieldDropdown = class extends InputField {
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
