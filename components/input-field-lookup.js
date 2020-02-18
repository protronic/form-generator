const { InputFieldText } = require('./input-field-generic.js');

const genericLookUpQuery = function(input, query, db){
  let uri = 'http://prot-subuntu:8081/master';

  return fetch(uri,  {
      method: 'POST',
      body: JSON.stringify({q: query.split('?').join(`${input}`)}),
      headers: {
          'Content-Type': 'application/json'
      }
  })
      .then(response => response.json())
      .then(data => data.recordset);
}

module.exports.InputFieldLookup = class extends InputFieldText {
  constructor(){
      super();
      this.defaultOptions = {
          ...this.defaultOptions,
          ausgabeLabel: '',
          query: undefined,
          maxZeilen: 1
      }   
      this.dbValid = true;
      this.dbWarning = false;
      this.dbValMessage = '';
  }

  databaseLookup(input, event){
      if(event.target.validity.valid && event.target.value !== ''){
          genericLookUpQuery(input.value, this.options.query)
              .then(data => data.map(entry => Object.keys(entry).map(key => `${key}: ${entry[key]}`).join('<br>')))
              .then(data => {
                  if(data[0]) {
                      this.querySelector('.input-display').innerHTML = data[0];
                      this.dbValid = true;
                      this.dbWarning = false;
                      this.dbValMessage = '';
                      this.setValidityStatus(this.dbValid, this.dbValMessage, this.dbWarning);
                  } else {
                      this.dbValid = false;
                      this.dbWarning = true;
                      this.dbValMessage = 'Datenbank hat kein passendes Ergebniss zurück geliefert.';
                      this.setValidityStatus(this.dbValid, this.dbValMessage, this.dbWarning)
                  }
              })
              .catch(err => {
                console.error(err); 
                this.dbValid = true;
                this.dbWarning = true; 
                this.dbValMessage = 'Database could not be reached.';
                this.setValidityStatus(this.dbValid, this.dbValMessage, this.dbWarning);
              });
      } else {
          this.querySelector('.input-display').innerText = ''
          this.valid = false;
      }
  }
  
  connectedCallback(){
      super.connectedCallback();
      let input = this.querySelector('input');

      input.addEventListener('input', this.databaseLookup.bind(this, input))
      console.log(this.options.initialModel)
      if(this.options.initialModel) this.databaseLookup(input, {target: input});
      input.insertAdjacentHTML('afterend', `
          <br><span class="input-display"></span>
      `)
  }

  checkValidity(){
    if(super.checkValidity()){
      this.setValidityStatus(this.dbValid, this.dbValMessage, this.dbWarning);
      return true;
    } else {
      return false;
    }
    
  }
}

// customElements.define('input-field-lookup', InputFieldLookup);