const { InputField } = require('./input-field.js');

module.exports.InputFieldList = class extends InputField {
  constructor(){
      super();
      this.defaultOptions = {
          ...this.defaultOptions,
          standard: [],
          vorlage: [],
          hinzufügenLabel: '+',
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
              <button id="${this.options.name}-button" type="button" class="form-list-addbtn">${this.options.hinzufügenLabel}</button>
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