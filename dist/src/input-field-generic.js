const { InputField } = require('./input-field.js');

class GenericInputField extends InputField{
  constructor(inputType){
      super();
      this.defaultOptions = {
          ...this.defaultOptions,
          platzhalter: '',
          muster: '.*',
          inputType: inputType,
          history: 'local', // one of ['local', 'global', 'none']
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
              ${this.options.history !== 'none' ? `<history-input-extender history-source="${this.options.history}"></history-input-extender>` : ''}
              <span class="validity-message"></span>
              <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
          </div>
      `);
      this.querySelector(`#${this.options.name}`).addEventListener('input', this.dispatchCustomEvent.bind(this, 'form-input'));
  }

  getModel(){
      let formControl = this.querySelector(`#${this.options.name}`);
      let model = formControl ? formControl.value : undefined;
      let resultModel = model != '' ? model.split('@').join('&#64;').split("'").join("&#39;") : undefined;
      return resultModel;
  }

  checkValidity(){
      let valid = super.checkValidity(false);
      let input = this.querySelector(`input#${this.options.name}`);
      let inputValidity = input.validity.valid;

      if(!inputValidity){
          this.setValidityStatus(false, input.validationMessage);
      } else {
          this.setValidityStatus(true, '');
      }

      return valid && inputValidity;
  }
}

const InputFieldText = module.exports.InputFieldText = class extends GenericInputField{
  constructor(){
      super('text');
  }
}

module.exports.InputFieldEmail = class extends GenericInputField{
  constructor(){
      super('email');
  }
}

module.exports.InputFieldTel = class extends GenericInputField{
  constructor(){
      super('tel');
  }
}

module.exports.InputFieldDate = class extends GenericInputField{
  constructor(){
    super('date');
    this.defaultOptions = {
      ...this.defaultOptions,
      standard: (new Date()).toLocaleDateString('en-CA'),
      min: undefined,
      max: undefined
    };
  }
}

module.exports.InputFieldNumber = class extends GenericInputField{
  constructor(){
    super('number');
    this.defaultOptions = {
      ...this.defaultOptions,
      min: 0,
      max: undefined,
    }
  }
}

const EnumListableMixin = module.exports.EnumListableMixin = superclass => class extends superclass {
  constructor(){
    super();
    this.defaultOptions = {
      ...this.defaultOptions,
      standard: [],
    }
  }

  applyTemplate(){
    this.options.initialModel = this.options.initialModel.join(', ');
    super.applyTemplate();
  }

  getModel(){
    let rawModel = super.getModel();
    let model = rawModel ? rawModel.split(',').map(listEle => listEle.trim()) : undefined;
    return model;
  }
}

module.exports.InputFieldEnumListText = class extends EnumListableMixin(InputFieldText){
  constructor(){
    super();
  }
}


