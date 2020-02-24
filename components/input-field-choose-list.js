const { InputFieldText } = require('./input-field-generic.js');
const { genericLookUpQuery } = require('./input-field-lookup.js');


module.exports.InputFieldChooseList = class extends InputFieldText {
  constructor(){
      super();
      this.defaultOptions = {
          ...this.defaultOptions,
          listenQuery: '',
          formWert: ''
      }
      this.orig_list_items = [];
  }

  applyTemplate(){
      this.rootElement.insertAdjacentHTML('beforeend', `
          <div class="form-element">
              <input 
                  class="filter-input"
                  type="text"
                  placeholder="Filter"
              >
              <ul class="choose-list">

              </ul>
              ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
              <input id="${this.options.name}" type="text"> 
              <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
          </div>
      `);

      genericLookUpQuery('', this.options.listenQuery).then(data => {
        this.orig_list_items = data.map(entry => `<li onclick="((event) => ([...event.target.parentElement.children].forEach(child => child.classList.remove('selected')), event.target.classList.add('selected'), document.querySelector('#${this.options.name}').value = event.target.value))(event)" value="${entry[this.options.formWert]}">${Object.keys(entry).map(key => entry[key]).join(', ')}</li>`);
        let choose_list = this.querySelector('.choose-list');
        choose_list.innerHTML = this.orig_list_items.join('\n');
        this.querySelector('.filter-input').addEventListener('input', (event) => 
          (choose_list.innerHTML = this.orig_list_items.filter(value => value.toLowerCase().includes(event.target.value)).join('\n'))
        );
      })
  }
}