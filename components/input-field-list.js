const { InputField } = require('./input-field.js');


module.exports.InputFieldList = class extends InputField {
    constructor() {
        super();
        this.defaultOptions = {
            ...this.defaultOptions,
            standard: [],
            vorlage: [],
            hinzufuegenLabel: '+',
            entfernenLabel: '-',
            autohinzufuegen: false,
            keineLeeren: false,
        };
    }

    autoHinzufuegenHandler(ev) {
        // console.log(this);
        if ((ev.key === 'Enter') && this.options.autohinzufuegen) {
            // this.addListItemHandler(ev);
            ev.preventDefault();
            this.querySelector('button.form-list-addbtn').click();
            
            // setTimeout(() => {
            //     // console.log(ev.srcElement.parentElement.parentElement.parentElement);
            //     if(this.options.vorlage.length > 0 && this.options.vorlage[0].feldtyp){
            //         // ev.srcElement.parentElement.parentElement.parentElement.querySelector(`${this.mapFieldType(this.options.vorlage[0].feldtyp)}:last-of-type input`).focus()
            //     }
            // }, 50); 
        }
    }

    addListItemHandler(event) {
        // console.log(this);
        let self = event.srcElement.parentElement.parentElement;
        let lfdNr = event.srcElement.previousElementSibling.childNodes.length ? 0 : event.srcElement.previousElementSibling.childNodes.length;
        let newEle = self.getElementTemplate('', lfdNr);
        event.srcElement.previousElementSibling.insertAdjacentHTML('beforeend', newEle);
        setTimeout(() => { 
            let mapFieldTypesSelectors = this.options.vorlage.map(formElement => `${this.mapFieldType(formElement.feldtyp)}:last-of-type input`);
            console.log(mapFieldTypesSelectors);
            if(mapFieldTypesSelectors.length > 0){
                event.srcElement.previousElementSibling.querySelector(mapFieldTypesSelectors[0]).addEventListener('keydown', this.autoHinzufuegenHandler.bind(this)); 
            }
            this.applyFocusPriority();
        }, 200);
    }

    applyTemplate() {
        this.rootElement.insertAdjacentHTML('beforeend', `
                <div class="form-element">
                    ${this.options.label ? `<label for="${this.options.name}">${this.options.label}</label><br>` : ''}
                    <div class="form-list" id="${this.options.name}" ${this.options.deaktiviert ? 'disabled' : ''}>
                        ${(this.options.initialModel.length > 0) ? this.options.initialModel.map((listItem, lfdNr) => {
                            return this.getElementTemplate(listItem, lfdNr)
                        }).join('\n') : ''}
                        ${(this.options.initialModel.slice(-1) || this.options.initialModel.length == 0) && (this.options.autohinzufuegen || this.options.keineLeeren) ? this.getElementTemplate('', this.options.initialModel.length) : ''}
                    </div>
                    <button id="${this.options.name}-button" type="button" class="form-list-addbtn">${this.options.hinzufuegenLabel}</button>
                    <span class="pflichtfeld" style="font-style: italic; visibility: ${this.options.pflichtfeld ? 'visible' : 'hidden'};">Pflichtfeld</span>
                </div>
            `);
        
        this.querySelectorAll('div.form-list input').forEach((listEle, index) => {
            console.log("Adding keydown listener to list element", index, listEle);
            listEle.addEventListener('keydown', this.autoHinzufuegenHandler.bind(this));
        });
        this.querySelector('button.form-list-addbtn').addEventListener('click', this.addListItemHandler.bind(this))
    }

    applyFocusPriority(){
        this.querySelector('.form-element > .form-list > *:not(button):last-of-type').applyFocusPriority();
    }

    getElementTemplate(listItem, lfdNr) {
        return `
          ${this.options.vorlage.map(formElement => `
              <${this.mapFieldType(formElement.feldtyp)} 
                  ${Object.keys(formElement).map(key => `${key}='${this.saveValue(key, formElement[key], lfdNr)}'`).join(' ')}
                  initialModel='${this.saveValue('initialModel', listItem)}'
              ></${this.mapFieldType(formElement.feldtyp)}>
          `).join('\n')}
          <button class="form-list-removebtn" tabIndex="-1" onclick="this.previousElementSibling.classList.add('delete-waiting'); if(confirm('sicher, dass der gewählte Eintrag gelöscht werden soll?')) (function(event){event.srcElement.previousElementSibling.remove(); event.srcElement.remove()})(event); else this.previousElementSibling.classList.remove('delete-waiting')" type="button">${this.options.entfernenLabel}</button>
      `;
    }

    saveValue(key, value, index) {
        if (key === 'query' || key === 'listenQuery') value = value.split("'").join("&#39;");
        if (key === 'name') {
            // console.log(JSON.stringify(`${value}-${index}`))
            return JSON.stringify(`${value}-${index}`);
        } else {
            return JSON.stringify(value);
        }
    }

    getModel() {
        let model = [];
        this.querySelectorAll(`#${this.options.name} > :not(button)`).forEach(listEle => {
            model.push(listEle.getModel());
        });
        if(this.options.keineLeeren) model = model.filter(item => item != undefined && item != "" && item != null)
        if (model.length === 0)
            return [];
        else
            return model;
    }

    checkValidity() {
        let valid = true;

        this.querySelectorAll(`#${this.options.name} > :not(button)`).forEach(listEle => {
            valid = valid && listEle.checkValidity();
        })

        return valid;
    }
}

// customElements.define('input-field-list', InputFieldList);