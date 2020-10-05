const { InputField } = require('./input-field.js');

module.exports.InfoFieldSummary = class extends InputField{
  constructor(){
      super();
      this.defaultOptions = {
          ...this.defaultOptions,
          observed_fields: []
      };
  }

  countFields(){
    let result = {};
    this.options.observed_fields.forEach((field) => {
      let foundObjs = document.querySelectorAll(`#${field}`);
      foundObjs.forEach((foundObj) => {
        let fieldObj = foundObj.parentElement.parentElement;
        let model = fieldObj.getModel();
        if(model) model.forEach((item) => {
          result[item] = result[item] === undefined ? 1 : result[item] + 1;
        })
      });      
    })
    return result;
  }

  runCounting(){
    let countedFields = this.countFields();
    this.resultList.innerHTML = `${Object.keys(countedFields).map((item) => `<li>${countedFields[item]} x <span class="span-fett">${item}</span></li>`).join('')}`;
  }

  applyTemplate(){
      this.rootElement.insertAdjacentHTML('beforeend', `
          <div class="form-element">
              ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
              <ul id=${this.options.name}></ul>
          </div>
      `);
      this.resultList = this.querySelector(`#${this.options.name}`);
      document.querySelector('.form-root').addEventListener('form-valid', this.runCounting.bind(this));
      setTimeout(this.runCounting.bind(this), 1000);
  }

  getModel(){
      return undefined;
  }
}