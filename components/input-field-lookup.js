const { InputFieldText } = require("./input-field-generic.js");
const { debounce } = require('lodash');

const genericLookUpQuery = module.exports.genericLookUpQuery = function(uri, input, query, db) {
  // let uri = "http://prot-subuntu:8081/master";

  return fetch(uri, {
    method: "POST",
    body: JSON.stringify({ q: query.split("?").join(`${input}`) }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => (response.json()))
    .then(data => (console.log(data), data.recordset));
};

// customElements.define('input-field-lookup', InputFieldLookup);

const LookupMixin = module.exports.LookupMixin = superclass => class extends superclass{
  constructor() {
    super();
    this.defaultOptions = {
      ...this.defaultOptions,
      ausgabeLabel: "",
      queryUrl: '',
      query: undefined,
      maxZeilen: 1
    };
    this.setAsyncValidity(true, "", false);
  }

  databaseLookup(inputValueFn, event) {
    if (event.target.validity ? event.target.validity.valid : event.target.valid && event.target.value !== "") {
      genericLookUpQuery(this.options.queryUrl, inputValueFn.bind(this)(), this.options.query)
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
      // try{
      //   throw Error('use focusout')
      //   let input = this.querySelector(`input`);
      //   input.addEventListener("input", this.databaseLookup.bind(this, input.value));
      //   if (this.options.initialModel)
      //     this.databaseLookup(input.value, { target: input });
      //   input.insertAdjacentHTML("afterend", `
      //         <br><span class="output-display"></span>
      //     `);
      // } catch(err) {
      //   console.log('Probably no input element found');
      //   console.error(err);
      try{
        let debouncedDBLookup = debounce(this.databaseLookup, 1000, {trailing: true, leading: false, maxWait: 5000});
        let input = this.querySelector('input');
        input.addEventListener('input', debouncedDBLookup.bind(this, this.getModel));  
      } catch(err){
        console.log('probably no Input field. Fallback tp focusout.');
        console.error(err);

        this.addEventListener('focusout', this.databaseLookup.bind(this, this.getModel));
      }
      
      
      if(this.options.initialModel)
          this.databaseLookup(this.getModel, { target: this});
      this.querySelector('.form-element').insertAdjacentHTML('beforeend', `
          <br><span class="output-display"></span>
      `);
      // }
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

  setValidityStatus(valid, message, warning) {
    if(!valid) this.querySelector(".output-display").innerText = "";
    return super.setValidityStatus(valid, message, warning)
  }

  setAsyncValidity(valid, message, warning) {
    if(!valid){
      this.querySelector(".output-display").innerText = "";
    }
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