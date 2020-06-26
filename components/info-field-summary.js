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
      fieldObj = document.querySelector(`#${field}`).parentElement.parentElement;
      fieldObj.getModel().forEach((item) => {
        result[item] = result[item] === undefined ? 1 : result[item]++;
      })
    })
    return result;
  }

  applyTemplate(){
      this.rootElement.insertAdjacentHTML('beforeend', `
          <div class="form-element">
              ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
              <ul id=${this.options.name}></ul>
          </div>
      `);
      let resultList = this.querySelector(`#${this.options.name}`);
      this.querySelector('.form-root').addEventListener('form-valid', () => {
        console.log({this:this, resultList: resultList});
        let countedFields = this.countFields();
        resultList.innerHTML = `${Object.keys(countedFields).map((item) => `<li>${countedFields[item]} x ${item}</li>`)}`;
      })
  }

  getModel(){
      return undefined;
  }
}