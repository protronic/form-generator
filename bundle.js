(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FormCreator = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { InputFieldText } = require('./input-field-generic.js');

const DependenceMixin = module.exports.DependenceMixin = superclass => class extends superclass {
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
      super.applyTemplate();
      this.linkDependency();
  }

  checkDependence(dependent, event){
      if(dependent.getModel() === this.options.wertSichtbar){
          this.showField();
      } else {
          this.hideField();
      }
  }

  linkDependency(){
      let dependent = document.querySelector(`*[name='${this.saveValue('abhaengigFeld', this.options.abhaengigFeld)}']`);
      dependent.addEventListener('focusout', this.checkDependence.bind(this, dependent));
      setInterval(this.checkDependence.bind(this, dependent), this.options.interval);
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

module.exports.InputFieldAbhaengig = class extends DependenceMixin(InputFieldText){
  constructor(){
    super();
  }
}


/** evtl könnte es auch von InputFieldNachschlagen erben ... */
module.exports.test = class extends InputFieldText {
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
      super.applyTemplate();
      this.linkDependency();
  }

  checkDependence(dependent, event){
      if(dependent.getModel() === this.options.wertSichtbar){
          this.showField();
      } else {
          this.hideField();
      }
  };

  linkDependency(){
      let dependent = this.parentElement.querySelector(`*[name='${this.saveValue('abhaengigFeld', this.options.abhaengigFeld)}']`);
      dependent.addEventListener('focusout', this.checkDependence.bind(this, dependent));
      setInterval(this.checkDependence.bind(this, dependent), this.options.interval);
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

},{"./input-field-generic.js":6}],2:[function(require,module,exports){
const { InputFieldObject } = require('./input-field-object.js');
const { fieldTypeMap } = require('./formular-components.js');

require('../style.css');

Object.keys(fieldTypeMap).forEach(keyTag => {
  customElements.define(fieldTypeMap[keyTag].tag, fieldTypeMap[keyTag].conName);
});

function prepareModel(model, formular){
    let user = '';
    let changedTime = (new Date()).getTime();

    try{
        user = wikiContext.UserName;
    } catch(err) {
        console.log('wikiContext not in scope.');
        console.error(err);
    }

    model['#parentForm'] = formular;
    model['#changed_user'] = user;
    model['#changed_time'] = changedTime;

    return JSON.stringify(JSON.stringify(model)).slice(1, -1);
}

function uploadNewModel(model, formular){
    let serialModel = prepareModel(model, formular);
    return fetch('http://prot-subuntu:8081/formly', {
        method: 'POST',
        body: `{"q": "INSERT INTO model (log) VALUES ('${serialModel}');SELECT TOP 1 _id FROM model WHERE log = '${serialModel}' ORDER BY _id DESC;"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(dataRows => dataRows.recordset[0]._id)
}

function uploadExistingModel(model, formular){
    let serialModel = prepareModel(model, formular);
    return fetch('http://prot-subuntu:8081/formly', {
        method: 'POST',
        body: `{"q": "UPDATE model SET log = '${serialModel}' WHERE _id = ${model['#modelID']}"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then(response => console.log(response))
}

function loadModelFromDB(modelId){
    return fetch('http://prot-subuntu:8081/formly', {
        method: 'POST',
        body: `{"q": "SELECT log FROM model WHERE _id = ${modelId}"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(dataRows => dataRows.recordset[0].log)
}

class FormCreator extends InputFieldObject{
    constructor(){
        super();
        this.model = {};
    }

    connectedCallback(){
        let schemaLink = this.getAttribute('schemalink');
        
        this.rootElement = document.createElement('form');
        this.rootElement.classList.add('form-root');
        this.append(this.rootElement);

        fetch(schemaLink)
            .then(response => response.json())
            .then(schema => {
                console.log(this.schema)
                this.schema = schema;
                this.options.name = schema.formular;
                this.options.label = `${schema.formular}`;
                this.options.subform = schema.felder;

                try{
                    // this.options.initialModel = this.loadFromLocal();
                    // this.options.initialModel = loadModelFromDB()
                    let url = new URL(location.href);
                    let modelId = url.searchParams.get('mid');

                    if(modelId){
                        loadModelFromDB(modelId).then(model => {
                            this.model = this.convertValue('initialModel', model);
                            console.log(this.convertValue('initialModel', model))
                            this.model['#modelID'] = modelId;
                            this.options.name = schema.formular;
                            this.options.label = `${this.options.label} ${modelId}`;
                            this.options.initialModel = this.convertValue('initialModel', model);
                            this.rootElement.options = this.options;
                            this.applyTemplate();
                        })    
                    } else {
                        this.options.initialModel = this.loadFromLocal();
                        this.rootElement.options = this.options;
                        this.applyTemplate()
                    }
                } catch(err) {
                    console.log(this.options.initialModel);
                    console.error(err);
                }

                // this.testModelCreation();
                this.uploadModelButton();
                this.newFormularButton();
                this.renderGeneralInfo(schema);
            })
    }

    renderGeneralInfo(schema){
        this.insertAdjacentHTML('afterbegin', `
            <div class="formular-title">
                <h2>${schema.formular}</h2>
            </div>
        `)
    }

    testModelCreation(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            if(this.checkValidity()){
                this.model = {...this.model, ...this.getModel()};
                console.log(this.model);
                this.saveFormLocal(this.model['#modelID'], this.model);
            } else {
                console.error('Einige Formular Elemente sind nicht korrekt ausgefüllt.');
            }
        });
        btn.innerText = 'Erzeuge Model';
        this.append(btn)
    }

    newFormularButton(){
        let uri = new URL(location.href);
        uri.searchParams.set('lsid', 'null');
        uri.searchParams.delete('mid');
        
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            location.href = uri.href;
        });
        btn.innerText = 'Neu Anlegen';
        this.append(btn);
    }

    uploadModelButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            if(this.checkValidity()){
                this.model = {...this.model, ...this.getModel()};
                this.saveFormLocal(this.model['#modelID'], this.model);
                if(this.model['#modelID']){
                    console.log(this.model)
                    uploadExistingModel(this.model, this.schema.formular)
                        .then(() => alert(`Änderungen an ${this.model['#modelID']} wurden gespeichert.`))
                } else {
                    uploadNewModel(this.model, this.schema.formular)
                        .then(modelId => 
                            (this.model['#modelID'] = modelId,
                            this.querySelector('label[for="Reparaturbericht"]').innerText = `${this.options.label} ${modelId}`, 
                            alert(`Daten wurden erfolgreich in der Datenbank unter folgender ID abgelegt.\n${modelId}`))
                        );
                }
                
            } else {
                console.log('invalid')
            }
        });
        btn.innerText = 'Speichern';
        this.append(btn);
    }

    loadFromLocal(localStorageId){
        if(!localStorageId){
            let uri = new URL(location.href);
            localStorageId = uri.searchParams.get('lsid');
            localStorageId = localStorageId === null ? 'last' : localStorageId;
        }
               
        return this.convertValue('initialModel', localStorage.getItem(localStorageId));
    }

    saveFormLocal(modelId, model){
        let serializedModel = this.saveValue('model', model);
        
        console.group('saving model to localStorage')

        if(modelId){
            localStorage.setItem(`${modelId}-${this.schema.formular}`, serializedModel);
            console.log('saved as:', `${modelId}-${this.schema.formular}`);
        }

        let lastSaves = parseInt(localStorage.getItem('last-x'));

        if(Number.isNaN(lastSaves) || lastSaves >= 10){
            localStorage.setItem('last-x', 0);
            localStorage.setItem('last-0', serializedModel);
            console.log('saved as:', 'last-0');
        } else {
            localStorage.setItem('last-x', lastSaves + 1);
            localStorage.setItem(`last-${lastSaves + 1}`, serializedModel);
            console.log('saved as:', `last-${lastSaves + 1}`);
        }

        localStorage.setItem('last', serializedModel);
        console.log('saved as:', `last`);

        console.groupEnd();
    }
}

customElements.define('form-creator', FormCreator);
},{"../style.css":14,"./formular-components.js":3,"./input-field-object.js":9}],3:[function(require,module,exports){
const { InputFieldText, InputFieldEnumListText, EnumListableMixin, InputFieldEmail, InputFieldTel, InputFieldDate, InputFieldNumber } = require('./input-field-generic.js');
const { InputFieldTextarea } = require('./input-field-textarea.js');
const { InputFieldBoolean } = require('./input-field-boolean.js');
const { InputFieldDropdown } = require('./input-field-dropdown.js');
const { InputFieldRadio } = require('./input-field-radio.js');
const { InputFieldLookup } = require('./input-field-lookup.js');
const { InputFieldAbhaengig, DependenceMixin } = require('./dependent-fields.js');
const { InputFieldList } = require('./input-field-list.js');
const { InputFieldObject } = require('./input-field-object.js');

const InputFieldDependentEnumTextarea = class extends EnumListableMixin(DependenceMixin(InputFieldTextarea)){
    constructor(){
        super();
    }
}

const fieldTypeMap = module.exports.fieldTypeMap = {
    'text': {
        tag: 'input-field-text',
        conName: InputFieldText,
    },
    'enumtext': {
        tag: 'input-field-enumlisttext',
        conName: InputFieldEnumListText,
    },
    'dependentenumtextarea': {
        tag: 'input-field-dependentenumtextarea',
        conName: InputFieldDependentEnumTextarea,
    },
    'email': {
        tag: 'input-field-email',
        conName: InputFieldEmail,
    },
    'tel': {
        tag: 'input-field-tel',
        conName: InputFieldTel,
    },
    'date': {
        tag: 'input-field-date',
        conName: InputFieldDate,
    },
    'number': {
        tag: 'input-field-number',
        conName: InputFieldNumber,
    },
    'textarea': {
        tag: 'input-field-textarea',
        conName: InputFieldTextarea,
    },
    'boolean': {
        tag: 'input-field-boolean',
        conName: InputFieldBoolean,
    },
    'dropdown': {
        tag: 'input-field-dropdown',
        conName: InputFieldDropdown,
    },
    'radio': {
        tag: 'input-field-radio',
        conName: InputFieldRadio,
    },
    'lookup': {
        tag: 'input-field-lookup',
        conName: InputFieldLookup,
    },
    'dependenttext': {
        tag: 'input-field-abhaengig',
        conName: InputFieldAbhaengig,
    },
    'list': {
        tag: 'input-field-list',
        conName: InputFieldList,
    },
    'object': {
        tag: 'input-field-object',
        conName: InputFieldObject,
    },
};

// const tagClassMap = {
//     'input-field-text': InputFieldText,
//     'input-field-enumlisttext': InputFieldEnumListText,
//     'input-field-dependentenumtextarea': InputFieldDependentEnumTextarea,
//     'input-field-email': InputFieldEmail,
//     'input-field-tel': InputFieldTel,
//     'input-field-date': InputFieldDate,
//     'input-field-textarea': InputFieldTextarea,
//     'input-field-boolean': InputFieldBoolean,
//     'input-field-dropdown': InputFieldDropdown,
//     'input-field-radio': InputFieldRadio,
//     'input-field-lookup': InputFieldLookup,
//     'input-field-abhaengig': InputFieldAbhaengig,
//     'input-field-list': InputFieldList,
//     'input-field-object': InputFieldObject,
//   }
  
},{"./dependent-fields.js":1,"./input-field-boolean.js":4,"./input-field-dropdown.js":5,"./input-field-generic.js":6,"./input-field-list.js":7,"./input-field-lookup.js":8,"./input-field-object.js":9,"./input-field-radio.js":10,"./input-field-textarea.js":11}],4:[function(require,module,exports){
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

},{"./input-field.js":12}],5:[function(require,module,exports){
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

},{"./input-field.js":12}],6:[function(require,module,exports){
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

},{"./input-field.js":12}],7:[function(require,module,exports){
const { InputField } = require('./input-field.js');

module.exports.InputFieldList = class extends InputField {
  constructor(){
      super();
      this.defaultOptions = {
          ...this.defaultOptions,
          standard: [],
          vorlage: [],
          hinzufuegenLabel: '+',
          entfernenLabel: '-'
      };
  }

  addListItemHandler(event){
    let self = event.srcElement.parentElement.parentElement; 
    let lfdNr = event.srcElement.previousElementSibling.childNodes.length ? 0 : event.srcElement.previousElementSibling.childNodes.length;
    let newEle = self.getElementTemplate('', lfdNr);
  
    event.srcElement.previousElementSibling.insertAdjacentHTML('beforeend', newEle);
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
              <button id="${this.options.name}-button" type="button" class="form-list-addbtn">${this.options.hinzufuegenLabel}</button>
              <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
          </div>
      `);
      this.querySelector('button.form-list-addbtn').addEventListener('click', this.addListItemHandler)
  }

  getElementTemplate(listItem, lfdNr){
      return `
          ${this.options.vorlage.map(formElement => `
              <${this.mapFieldType(formElement.feldtyp)} 
                  ${Object.keys(formElement).map(key => `${key}='${this.saveValue(key, formElement[key], lfdNr)}'`).join(' ')}
                  initialModel='${this.saveValue('initialModel', listItem)}'
              ></${this.mapFieldType(formElement.feldtyp)}>
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

// customElements.define('input-field-list', InputFieldList);
},{"./input-field.js":12}],8:[function(require,module,exports){
const { InputFieldText } = require("./input-field-generic.js");

const genericLookUpQuery = function(input, query, db) {
  let uri = "http://prot-subuntu:8081/master";

  return fetch(uri, {
    method: "POST",
    body: JSON.stringify({ q: query.split("?").join(`${input}`) }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(data => data.recordset);
};

// customElements.define('input-field-lookup', InputFieldLookup);

const LookupMixin = module.exports.LookupMixin = superclass => class extends superclass{
  constructor() {
    super();
    this.defaultOptions = {
      ...this.defaultOptions,
      ausgabeLabel: "",
      query: undefined,
      maxZeilen: 1
    };
    this.setAsyncValidity(true, "", false);
  }

  databaseLookup(inputValue, event) {
    if (event.target.validity ? event.target.validity.valid : event.target.valid && event.target.value !== "") {
      genericLookUpQuery(inputValue, this.options.query)
        .then(data =>
          data.map(entry =>
            Object.keys(entry)
              .map(key => `${key}: ${entry[key]}`)
              .join("<br>")
          )
        )
        .then(data => {
          if (data[0]) {
            this.querySelector(".output-display").innerHTML = data[0];
            this.setAsyncValidity(true, "", false);
          } else {
            this.setValidityStatus(
              false,
              "Datenbank hat kein passendes Ergebniss zurück geliefert.",
              true
            );
          }
        })
        .catch(err => {
          console.error(err);
          this.setAsyncValidity(true, "Database could not be reached.", true);
        });
    } else {
      this.querySelector(".output-display").innerText = "";
      this.valid = false;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addLookupHandler()
  }

  addLookupHandler(){
      try{
        throw Error('use focusout')
        let input = this.querySelector(`input`);
        input.addEventListener("input", this.databaseLookup.bind(this, input.value));
        if (this.options.initialModel)
          this.databaseLookup(input.value, { target: input });
        input.insertAdjacentHTML("afterend", `
              <br><span class="output-display"></span>
          `);
      } catch(err) {
        console.log('Probably no input element found');
        console.error(err);

        this.addEventListener('focusout', this.databaseLookup.bind(this, this.getModel()));
        if(this.options.initialModel)
            this.databaseLookup(this.getModel(), { target: this});
        this.querySelector('.form-element').insertAdjacentHTML('beforeend', `
            <br><span class="output-display"></span>
        `);
      }
  }

  checkValidity() {
    if (super.checkValidity() && this.checkAsyncValidity()) {
      this.setValidityStatus(
        this.asyncValid,
        this.asyncValMessage,
        this.asyncWarning
      );
      return true;
    } else {
      return false;
    }
  }

  checkAsyncValidity(){
    if (this.asyncValid) {
        return true;
    } else {
        return false;
    }
  }

  setAsyncValidity(valid, message, warning) {
    this.asyncValid = valid;
    this.asyncWarning = warning;
    this.asyncValMessage = message;
    this.setValidityStatus(valid, message, warning);
  }
}

module.exports.InputFieldLookup = class extends LookupMixin(InputFieldText) {
  constructor(){
    super();
  }
}
},{"./input-field-generic.js":6}],9:[function(require,module,exports){
const { InputField } = require('./input-field.js');

module.exports.InputFieldObject = class extends InputField{
  constructor(){
      super();
      this.defaultOptions = {
          ...this.defaultOptions,
          subform: {}
      };
      this.collapsed = false;
  }

  collapseObjectGroupHandler(event){
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

  applyTemplate(){
      this.rootElement.insertAdjacentHTML('beforeend', `
          <div class="form-element">
              <button class="form-object-collapse" type="button" tabIndex="-1">einklappen</button>
              ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
              <div id="${this.options.name}" class="form-group">
                  ${Object.keys(this.options.subform).map(key => {
                      let sub = this.options.subform[key];
                      let result = `
                          <${this.mapFieldType(sub.feldtyp)} 
                              ${Object.keys(sub).map(key => `${key}='${this.saveValue(key, sub[key])}'`).join(' ')}
                              ${this.options.initialModel && (this.options.initialModel[sub.name]) ?  `initialModel='${this.saveValue('initialModel', this.options.initialModel[sub.name])}'` : ''} 
                          ></${this.mapFieldType(sub.feldtyp)}>`;
                      return result;
                  }).join('\n')}
              </div>
          </div>
      `);
      this.querySelector('button.form-object-collapse').addEventListener('click', this.collapseObjectGroupHandler);
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

},{"./input-field.js":12}],10:[function(require,module,exports){
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

},{"./input-field.js":12}],11:[function(require,module,exports){
const { InputField } = require('./input-field.js');

module.exports.InputFieldTextarea = class extends InputField{
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
},{"./input-field.js":12}],12:[function(require,module,exports){
// const { fieldTypeMap } = require('./formular-components.js')

const fieldTypeMap = {
    'text': 'input-field-text',
    'enumtext': 'input-field-enumlisttext',
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
};

module.exports.InputField = class extends HTMLElement {
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
}
},{}],13:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

var styleElementsInsertedAtTop = [];

var insertStyleElement = function(styleElement, options) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];

    options = options || {};
    options.insertAt = options.insertAt || 'bottom';

    if (options.insertAt === 'top') {
        if (!lastStyleElementInsertedAtTop) {
            head.insertBefore(styleElement, head.firstChild);
        } else if (lastStyleElementInsertedAtTop.nextSibling) {
            head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
        } else {
            head.appendChild(styleElement);
        }
        styleElementsInsertedAtTop.push(styleElement);
    } else if (options.insertAt === 'bottom') {
        head.appendChild(styleElement);
    } else {
        throw new Error('Invalid value for parameter \'insertAt\'. Must be \'top\' or \'bottom\'.');
    }
};

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes, extraOptions) {
        extraOptions = extraOptions || {};

        var style = document.createElement('style');
        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }

        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        } else if (style.styleSheet) { // for IE8 and below
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        }
    }
};

},{}],14:[function(require,module,exports){
var css = "/* form, .formular-title {\r\n  width: 800px;\r\n} */\nform-creator {\n  width: 800px;\n  display: block;\n}\n.formular-title > * {\n  text-align: center;\n}\ndiv.form-element {\n  margin: 5px;\n}\ndiv.form-group {\n  border: 1px solid lightgray;\n}\nspan.pflichtfeld {\n  /* float: right; */\n  position: absolute;\n  bottom: 0px;\n  right: 0px;\n  margin: 5px;\n  vertical-align: bottom;\n}\n.form-list > *[name] {\n  display: inline-block;\n  width: 100%;\n}\n.form-list {\n  display: grid;\n  grid-template-columns: 95% 5%;\n  border-radius: 5px;\n  box-shadow: 2px 2px 20px 1px lightgray;\n}\n.form-list > button.form-list-removebtn {\n  margin-top: auto;\n  margin-bottom: auto;\n  width: 100%;\n  height: 95%;\n  background-color: rgba(200, 0, 0, 0.5);\n  padding: 2px;\n}\n.form-list-addbtn {\n  clear: both;\n  position: relative;\n  width: 99%;\n  display: block;\n  background-color: rgba(0, 200, 0, 0.5);\n  box-sizing: content-box;\n  padding: 2px;\n}\n.form-element {\n  position: relative;\n  border: 1px solid lightgray;\n  padding: 5px;\n  margin-top: 10px;\n  margin-bottom: 10px;\n  border-radius: 10px;\n  box-shadow: inset 2px 2px 5px 1px lightgray;\n}\n.form-element > label {\n  font-weight: bold;\n  vertical-align: top;\n}\n/* .form-list label {\r\n  font-weight: normal;\r\n} */\n.form-group {\n  border-radius: 10px;\n  box-shadow: 2px 2px 20px 1px lightgray;\n}\n/* .form-group label {\r\n  font-weight: normal;\r\n} */\n/* .form-group * label {\r\n  font-weight: lighter;\r\n} */\n.input-display {\n  color: gray;\n}\n.form-object-collapse {\n  /* float: right; */\n  position: absolute;\n  right: 0px;\n  top: 0px;\n  font-size: small;\n  margin-top: 0px;\n  background-color: white;\n  z-index: 1;\n}\n.clear-radio-btn {\n  /* float: right; */\n  position: absolute;\n  right: 0px;\n  top: 0px;\n  font-size: small;\n  background-color: lightpink;\n}\nform-creator .hidden {\n  /* visibility: collapse; */\n  display: none;\n  height: 0;\n}\nform-creator input,\ntextarea {\n  border-radius: 5px;\n}\nform-creator label {\n  margin-right: 10px;\n}\nform-creator button {\n  border-radius: 10px;\n}\n/* Invalid Styling */\n.invalid > div.form-element {\n  border: 1px solid #ff0b0bd8;\n  box-shadow: inset 2px 2px 10px 2px #ff0b0bd8;\n}\n.invalid,\n.warning {\n  position: relative;\n  text-decoration: none;\n}\n.warning:after,\n.invalid:after {\n  content: attr(data-tooltip);\n  position: absolute;\n  bottom: 130%;\n  left: 20%;\n  background: #d60f0f;\n  padding: 5px 15px;\n  color: white;\n  -webkit-border-radius: 10px;\n  -moz-border-radius: 10px;\n  border-radius: 10px;\n  white-space: nowrap;\n  opacity: 0;\n  -webkit-transition: all 0.4s ease;\n  -moz-transition: all 0.4s ease;\n  transition: all 0.4s ease;\n}\n.warning:not(.invalid):after {\n  right: -700px;\n  left: unset;\n}\n.invalid:before {\n  content: \"\";\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-top: 20px solid #d60f0f2d;\n  border-left: 20px solid transparent;\n  border-right: 20px solid transparent;\n  -webkit-transition: all 0.4s ease;\n  -moz-transition: all 0.4s ease;\n  transition: all 0.4s ease;\n  opacity: 0;\n  left: 30%;\n  bottom: 90%;\n}\n.invalid:hover:after,\n.warning:hover:after {\n  bottom: 100%;\n}\n.invalid:hover:before,\n.warning:hover:before {\n  bottom: 70%;\n}\n.invalid:hover:after,\n.invalid:before,\n.warning:hover:after,\n.warning:before {\n  opacity: 1;\n}\n.warning  > div.form-element {\n  border: 1px solid #ffda0bd8;\n  box-shadow: inset 2px 2px 10px 2px #ffda0bd8;\n}\n.warning:after {\n  background: #ffda0b;\n  color: black;\n}\n.warning:before {\n  border-top: 20px solid #ffda0b2d;\n}\n"; (require("browserify-css").createStyle(css, { "href": "style.css" }, { "insertAt": "bottom" })); module.exports = css;
},{"browserify-css":13}]},{},[2])(2)
});
