const { InputFieldObject } = require('./input-field-object.js');
const { fieldTypeMap } = require('./formular-components.js');

var baseUrl = 'http://10.19.28.94:8084/query'
// var schemaPath = '/schema'
// var modelPath = '/model'

Object.keys(fieldTypeMap).forEach(keyTag => {
  customElements.define(fieldTypeMap[keyTag].tag, fieldTypeMap[keyTag].conName);
});

class SearchParams {
    constructor(search){
        let self = this;
        search.slice(1).split('&').forEach(function(entry){
            let key = entry.split('=')[0];
            let value = entry.split('=')[1];

            self[key] = value;
        })
    }
    
    append(key, value){
        this[key] = value;
    }

    get(key){
        return this[key];
    }

    set(key, value){
        this[key] = value;
    }

    delete(key){
        delete this[key];
    }

    toString(){
        return ('?' + Object.keys(this).map(key => `${key}=${this[key]}`).join('&'));
    }
}

function prepareModel(model, formular){
    let user = '';
    let changedTime = (new Date()).getTime();

    try{
        user = wikiContext.UserName;
    } catch(err) {
        console.log('wikiContext not in scope.');
    }

    model['#parentForm'] = formular;
    model['#changed_user'] = user;
    model['#changed_time'] = changedTime;

    return JSON.stringify(model);
}

function uploadNewModel(model, formular){
    let serialModel = prepareModel(model, formular).split('"').join('\\"');
    return fetch(`${baseUrl}?database=formly`, {
        method: 'POST',
        body: `{"query": "INSERT INTO model (log) VALUES ('${serialModel}'); SELECT SCOPE_IDENTITY() as _id;"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => data[0]['_id'])
}

function uploadExistingModel(model, formular){
    let serialModel = prepareModel(model, formular).split('"').join('\\"');
    return fetch(`${baseUrl}?database=formly`, {
        method: 'POST',
        body: `{"query": "UPDATE model SET log='${serialModel}' WHERE _id=${model['#modelID']};"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then(response => console.log(response))
}

function loadModelFromDB(modelId){
    return fetch(`${baseUrl}?database=formly`, {
        method: 'POST',
        body: `{"query": "SELECT log FROM model WHERE _id=${modelId}"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(tableResponse => JSON.parse(tableResponse[0]['log']))
        .then(data => {console.log(data); return data})
}

function loadSchemaFromDB(schemaId){
    return fetch(`${baseUrl}?database=formly`, {
        method: 'POST',
        body: `{"query": "SELECT log FROM schemas WHERE _id=${schemaId};"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    }) 
    .then(response => response.json())
    .then(response => JSON.parse(response[0]['log']))
}

function getSchemaId(){
    return (new SearchParams(location.search)).get('schema');
}

class FormCreator extends InputFieldObject{
    constructor(){
        super();
        this.model = {};
    }

    connectedCallback(){        
        this.rootElement = document.createElement('form');
        this.rootElement.classList.add('form-root');
        this.appendChild(this.rootElement);
        baseUrl = this.getAttribute('data-url') ? this.getAttribute('data-url') : baseUrl;

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
            let modelId = (new SearchParams(location.search)).get('mid');

            if(modelId){
                loadModelFromDB(modelId).then(model => {
                    this.model = this.convertValue('initialModel', JSON.stringify(model));
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

        this.uploadModelButton();
        this.newFormularButton();
        this.newRemoveButton();
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
                this.saveFormLocal(this.model['#modelID'], this.model);
            } else {
                console.error('Einige Formular Elemente sind nicht korrekt ausgefüllt.');
            }
        });
        btn.innerText = 'Erzeuge Model';
        this.appendChild(btn)
    }

    createNewFormURL(){
        let uri = new URL(location.href);
        let search = (new SearchParams(location.search));
        search.set('lsid', 'null');
        search.delete('mid');
        uri.search = search.toString();
        return uri.href;
    }

    newFormularButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', () => {
            location.href = this.createNewFormURL();
        });
        btn.innerText = 'Neu Anlegen';
        this.appendChild(btn);
    }

    newRemoveButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', () => {
            if (this.model['#modelID'] && confirm(`Are you sure, you want to renove model with id: ${this.model['#modelID']}?`)){
                fetch(`${baseUrl}?database=formly`, {
                    method: 'POST',
                    body: `{"query": "DELETE FROM model WHERE _id=${this.model['#modelID']};"}`,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(res => (
                        res.ok ? 
                            location.href = this.createNewFormURL() : 
                            console.error(res.status)
                    ));
            }
        });
        btn.innerText = 'Remove Model';
        this.appendChild(btn);
    }

    uploadModelButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            if(this.checkValidity()){
                let modelResult = this.getModel();
                if(modelResult === undefined ){
                    console.log('empty model');
                } else {
                    this.model = {...this.model, ...modelResult};
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
            localStorageId = (new SearchParams(location.search)).get('lsid')
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

// customElements.define('prot-form-gen', FormCreator);
customElements.define('form-creator', FormCreator);