const { InputField } = require('./input-field.js');

module.exports.InputFieldTextarea = class extends InputField{
  constructor(){
      super();
      this.defaultOptions = {
          ...this.defaultOptions,
          platzhalter: '',
          cols: 50,
          rows: 5,
          wrap: 'soft',
          history: 'local',
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
                  title="${this.options.beschreibung}"
              >${(this.options.initialModel) ? this.options.initialModel : ''}</textarea>
              ${this.options.history !== 'none' ? `<history-input-extender history-source="${this.options.history}" history-input-selector="textarea"></history-input-extender>` : ''}
              <span class="validity-message"></span>
              <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
          </div>
      `);
      this.querySelector('textarea').addEventListener('input', this.dispatchCustomEvent.bind(this, 'form-input'))
  }

  getModel(){
      let formControl = this.querySelector(`#${this.options.name}`);
      let model = formControl ? formControl.value : undefined;
      let resultModel = model != '' ? model.split('@').join('&#64;').split("'").join("&#39;") : undefined;
      if (this.options.nomodel){
        localStorage.setItem(`${this.options.nomodel_unique_id}|${this.options.name}|${this.model['#modelID']}`, resultModel);
        return undefined;
      } 
      return resultModel;
  }
}