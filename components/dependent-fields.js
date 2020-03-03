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
      this.visibility = true;
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
      let dependent = this.parentElement.querySelector(`*[name='${this.saveValue('abhaengigFeld', this.options.abhaengigFeld)}']`);
      dependent.addEventListener('form-valid', this.checkDependence.bind(this, dependent));
      setInterval(this.checkDependence.bind(this, dependent), this.options.interval);
  }

  hideField(){
    if(this.visibility){
        this.visibility = false;
        this.classList.add('hidden');
    }
  }

  showField(){
    if(!this.visibility){
        this.visibility = true;
        this.classList.remove('hidden');
        this.checkValidity();    
    }
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
// module.exports.test = class extends InputFieldText {
//   constructor(){
//       super();
//       this.defaultOptions = {
//           ...this.defaultOptions,
//           abhaengigFeld: '',
//           wertSichtbar: '',
//           interval: 500,
//           //wertUnsichtbar: '',  erstmal default hidden, bei bedarf, kann logik erweitert werden.
//       }
//       this.hideField();   
//   }

//   applyTemplate(){
//       super.applyTemplate();
//       setTimeout(() => (this.linkDependency()), 0);
//   }

//   checkDependence(dependent, event){
//       if(dependent.getModel() === this.options.wertSichtbar){
//           this.showField();
//       } else {
//           this.hideField();
//       }
//   };

//   linkDependency(){
//       let dependent = this.parentElement.querySelector(`*[name='${this.saveValue('abhaengigFeld', this.options.abhaengigFeld)}']`);
//       dependent.addEventListener('focusout', this.checkDependence.bind(this, dependent));
//       setInterval(this.checkDependence.bind(this, dependent), this.options.interval);
//   }

//   hideField(){
//       this.classList.add('hidden');
//   }

//   showField(){
//       this.classList.remove('hidden');
//   }

//   getModel(){
//       if(this.visibility){
//           return super.getModel();
//       } else {
//           return undefined;
//       }
//   }

//   checkValidity(){
//       if(this.visibility){
//           return super.checkValidity();
//       } else {
//           return true;
//       }
//   }
// }
