const { InputFieldObject } = require('./input-field-object.js');
const { fieldTypeMap } = require('./formular-components.js');

// require('../altstyle.css');

var baseUrl = 'http://10.19.28.94:8000'
var schemaPath = '/schema'
var modelPath = '/model'

Object.keys(fieldTypeMap).forEach(keyTag => {
  customElements.define(fieldTypeMap[keyTag].tag, fieldTypeMap[keyTag].conName);
});

function prepareModel(model, formular){
    let user = '';
    let changedTime = (new Date()).getTime();

    try{
        user = wikiContext.UserName;
    } catch(err) {
        console.log('wikiContext not in scope.');
        // console.error(err);
    }

    model['#parentForm'] = formular;
    model['#changed_user'] = user;
    model['#changed_time'] = changedTime;

    // return JSON.stringify(JSON.stringify(model)).slice(1, -1);
    return JSON.stringify(model);
}

// function uploadNewModel(model, formular){
//     let serialModel = prepareModel(model, formular);
//     return fetch('http://prot-subuntu:8081/formly', {
//         method: 'POST',
//         body: `{"q": "INSERT INTO model (log) VALUES ('${serialModel}');SELECT TOP 1 _id FROM model WHERE log = '${serialModel}' ORDER BY _id DESC;"}`,
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//         .then(response => response.json())
//         .then(dataRows => dataRows.recordset[0]._id)
// }

function uploadNewModel(model, formular){
    let serialModel = prepareModel(model, formular);
    return fetch(`${baseUrl}${modelPath}`, {
        method: 'POST',
        body: `${serialModel}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => data['#modelID'])
}

// function uploadExistingModel(model, formular){
//     let serialModel = prepareModel(model, formular);
//     return fetch('http://prot-subuntu:8081/formly', {
//         method: 'POST',
//         body: `{"q": "UPDATE model SET log = '${serialModel}' WHERE _id = ${model['#modelID']}"}`,
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     }).then(response => response.json()).then(response => console.log(response))
// }

function uploadExistingModel(model, formular){
    let serialModel = prepareModel(model, formular);
    return fetch(`${baseUrl}${modelPath}/${model['#modelID']}`, {
        method: 'POST',
        body: serialModel,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then(response => console.log(response))
}

// function loadModelFromDB(modelId){
//     return fetch('http://prot-subuntu:8081/formly', {
//         method: 'POST',
//         body: `{"q": "SELECT log FROM model WHERE _id = ${modelId}"}`,
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//         .then(response => response.json())
//         .then(dataRows => dataRows.recordset[0].log)
// }

function loadModelFromDB(modelId){
    return fetch(`${baseUrl}${modelPath}/${modelId}`)
        .then(response => response.json())
        .then(data => {console.log(data); return data})
        // .then(dataRows => dataRows.recordset[0].log)
}

// function loadSchemaFromDB(schemaId){
//     return fetch('http://prot-subuntu:8081/formly', {
//         method: 'POST',
//         body: `{"q": "SELECT log FROM schemas WHERE _id= ${schemaId}"}`,
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     }) 
//     .then(response => response.json())
//     .then(dataRows => JSON.parse(dataRows.recordset[0].log))
// }

function loadSchemaFromDB(schemaId){
    return fetch(`${baseUrl}${schemaPath}/${schemaId}`) 
    .then(response => response.json())
    // .then(dataRows => dataRows)
}

function getSchemaId(){
    // let url = new URL(location.href);
    // return url.searchParams.get('schema');
    // (new URLSearchParams(location.search))
    return (new URLSearchParams(location.search)).get('schema');
}

class FormCreator extends InputFieldObject{
    constructor(){
        super();
        this.model = {};

        //TODO REMOVE after Test
        this.addEventListener('form-valid', (event => console.log(event))); 
    }

    connectedCallback(){        
        this.rootElement = document.createElement('form');
        this.rootElement.classList.add('form-root');
        this.appendChild(this.rootElement);

        loadSchemaFromDB(getSchemaId())
            .then(schema => {
                console.log(schema)
                this.applySchema(schema);
            })
    }

    applySchema(schema){
        console.log(schema)
        this.schema = schema;
        this.options.name = schema.formular;
        this.options.label = `${schema.formular}`;
        this.options.subform = schema.felder;

        try{
            // this.options.initialModel = this.loadFromLocal();
            // this.options.initialModel = loadModelFromDB()
            // let url = new URL(location.href);
            // let modelId = url.searchParams.get('mid');
            let modelId = (new URLSearchParams(location.search)).get('mid');

            if(modelId){
                loadModelFromDB(modelId).then(model => {
                    this.model = this.convertValue('initialModel', JSON.stringify(model));
                    // console.log(this.convertValue('initialModel', model))
                    this.model['#modelID'] = modelId;
                    this.options.name = schema.formular;
                    this.options.label = `${this.options.label} ${modelId}`;
                    this.options.initialModel = this.convertValue('initialModel', JSON.stringify(model));
                    this.rootElement.options = this.options;
                    this.applyTemplate();
                })    
            } else {
                this.options.initialModel = this.loadFromLocal();
                this.rootElement.options = this.options;
                this.applyTemplate()
            }
        } catch(err) {
            console.log(this.options.initialModel);
            console.error(err);
        }

        // this.testModelCreation();
        this.uploadModelButton();
        this.newFormularButton();
        this.renderGeneralInfo(schema);
    }

    renderGeneralInfo(schema){
        this.insertAdjacentHTML('afterbegin', `
            <div class="formular-title">
                <h2>${schema.formular}</h2>
            </div>
        `)
    }

    testModelCreation(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            if(this.checkValidity()){
                this.model = {...this.model, ...this.getModel()};
                // console.log(this.model);
                this.saveFormLocal(this.model['#modelID'], this.model);
            } else {
                console.error('Einige Formular Elemente sind nicht korrekt ausgefüllt.');
            }
        });
        btn.innerText = 'Erzeuge Model';
        this.appendChild(btn)
    }

    newFormularButton(){
        let uri = new URL(location.href);
        // uri.searchParams.set('lsid', 'null');
        // uri.searchParams.delete('mid');
        let search = (new URLSearchParams(location.search));
        search.set('lsid', 'null');
        search.delete('mid');
        uri.search = search.toString();
        
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            location.href = uri.href;
        });
        btn.innerText = 'Neu Anlegen';
        this.appendChild(btn);
    }

    uploadModelButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            if(this.checkValidity()){
                this.model = {...this.model, ...this.getModel()};
                this.saveFormLocal(this.model['#modelID'], this.model);
                if(this.model['#modelID']){
                    console.log(this.model)
                    uploadExistingModel(this.model, this.schema.formular)
                        .then(() => alert(`Änderungen an ${this.model['#modelID']} wurden gespeichert.`))
                } else {
                    uploadNewModel(this.model, this.schema.formular)
                        .then(modelId => 
                            (this.model['#modelID'] = modelId,
                            this.querySelector(`label[for="${this.schema.formular}"]`).innerText = `${this.options.label} ${modelId}`, 
                            alert(`Daten wurden erfolgreich in der Datenbank unter folgender ID abgelegt.\n${modelId}`))
                        );
                }
                
            } else {
                console.log('invalid')
            }
        });
        btn.innerText = 'Speichern';
        this.appendChild(btn);
    }

    loadFromLocal(localStorageId){
        if(!localStorageId){
            // let uri = new URL(location.href);
            // localStorageId = uri.searchParams.get('lsid');
            localStorageId = (new URLSearchParams(location.search)).get('lsid')
            localStorageId = localStorageId === null ? 'last' : localStorageId;
        }
               
        return this.convertValue('initialModel', localStorage.getItem(localStorageId));
    }

    saveFormLocal(modelId, model){
        let serializedModel = this.saveValue('model', model);
        
        console.group('saving model to localStorage')

        if(modelId){
            localStorage.setItem(`${modelId}-${this.schema.formular}`, serializedModel);
            console.log('saved as:', `${modelId}-${this.schema.formular}`);
        }

        let lastSaves = parseInt(localStorage.getItem('last-x'));

        if(Number.isNaN(lastSaves) || lastSaves >= 10){
            localStorage.setItem('last-x', 0);
            localStorage.setItem('last-0', serializedModel);
            console.log('saved as:', 'last-0');
        } else {
            localStorage.setItem('last-x', lastSaves + 1);
            localStorage.setItem(`last-${lastSaves + 1}`, serializedModel);
            console.log('saved as:', `last-${lastSaves + 1}`);
        }

        localStorage.setItem('last', serializedModel);
        console.log('saved as:', `last`);

        console.groupEnd();
    }
}

customElements.define('form-creator', FormCreator);