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
