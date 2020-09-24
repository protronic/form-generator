const { InputField } = require('./input-field.js');

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
              <div id="${this.options.name}-history-container" class="history hidden"></div>
              <span class="validity-message"></span>
              <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
          </div>
      `);
      this.querySelector(`#${this.options.name}`).addEventListener('input', this.dispatchCustomEvent.bind(this, 'form-input'));
      this.createHistoryStore();
  }

  createHistoryStore(){
    let root = document.querySelector('prot-form-gen');
    let inpEle = document.querySelector(`#${this.options.name}`);
    let contEle = document.querySelector(`#${this.options.name}-history-container`);
    let ulEle = document.createElement('ul');
    ulEle.addEventListener('click', function(event){
        let liEle = event.target;
        if(liEle.nodeName === 'li'){
            event.preventDefault();
            inpEle.value = liEle.innerText;
        }
    });
    inpEle.addEventListener('focus', function(event){
        contEle.classList.remove('hidden');
    });
    inpEle.addEventListener('blur', function(event){
        contEle.classList.add('hidden');
    });
    inpEle.addEventListener('keydown', function(event){
        if(event.which == 38){
            this.history_store.move(-1);
        }
        if(event.which == 40){
            this.history_store.move(1);
        }
    })

    historyEle.append(ulEle);
    let historyEle = document.querySelector(`#${this.options.name}-history-container > ul`);
    let form = root.schema.formular;
    let mid = root.modelId;
    let inp = this.options.name;

    this.history_store = {
        cursor: 0,
        previousEntries: localStorage.getItem(`${form}.${mid}.${inp}`) | [],
        filteredEntries: localStorage.getItem(`${form}.${mid}.${inp}`) | [],
        put: function(val){
            this.previousEntries.push(val);
            let entryEle = document.createElement('li');
            entryEle.innerText = val;
            historyEle.append(entryEle);
            this.save();
        },
        get: function(){
            return this.filteredEntries[this.cursor];
        },
        filter: function(str){
            let filtered = this.previousEntries.filter(entry => entry.startsWith(str));
            this.cursor = filtered.length - 1 < this.cursor ? filtered.length - 1 : this.cursor;
            this.filteredEntries = filtered;
        },
        move: function(dir){
            historyEle.childNodes.get(this.cursor).classList.remove('marked');
            let moved = this.cursor + dir;
            let max = this.filteredEntries.length - 1;
            this.cursor = (moved > 0) ? (moved < max ? moved : max) : 0;
            historyEle.childNodes.get(this.cursor).classList.remove('marked');
        },
        save: function(){
            localStorage.setItem(`${form}.${mid}.${inp}`, this.previousEntries);
        }
    }

    this.history_store.filteredEntries.forEach(entry => {
        let entryEle = document.createElement('li');
        entryEle.innerText = entry;
    })

  }

  getModel(){
      let formControl = this.querySelector(`#${this.options.name}`);
      let model = formControl ? formControl.value : undefined;
      let resultModel = model != '' ? model.split('@').join('&#64;').split("'").join("&#39;") : undefined;
      this.history_store.put(resultModel);
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


