const { InputFieldObject } = require('./input-field-object.js');
const { fieldTypeMap } = require('./formular-components.js');
const { createCustomAlert } = require('./custom-alert-box.js');
const { sendLogToLogstash } = require('./logging-connector.js');

var baseUrl = ''
// var baseUrl = 'http://10.19.28.94:8087'  // TESTCASE base URL

var schemaPath = '/schema'
var modelPath = '/model'

Object.keys(fieldTypeMap).forEach(keyTag => {
  customElements.define(fieldTypeMap[keyTag].tag, fieldTypeMap[keyTag].conName);
});

function sendErrorReport (errorMsg, form, model, message){
    let errorObj = Object.assign({
        appname: "json-form-creator",
        audit: true,
        form: form,
        model: model,
        error: errorMsg,
        message: message
    });
    sendLogToLogstash(errorObj);
    throw new Error(errorMsg);
}

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
    let serialModel = prepareModel(model, formular);
    return fetch(`${baseUrl}${modelPath}`, {
        method: 'POST',
        body: `${serialModel}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok)
                return response.json()
            else
                sendErrorReport(
                    `Verbindung zur Datenbank ist Fehlgeschlagen mit status ${response.status} und folgender Meldung: ${response.statusText}.`,
                    JSON.stringify(formular),
                    JSON.stringify(model),
                    `URL: ${baseUrl}${modelPath}}`
                );
        })
        .then(response => {
            if(!typeof response === 'number' && !typeof response === 'string')
                sendErrorReport(
                    "Speichern des Models ist aus einem unbekannten Grund fehlgeschlagen. Für mehr Informationen mit 'r.seidler' in Verbindung setzen.",
                    JSON.stringify(formular),
                    JSON.stringify(model),
                    `URL: ${baseUrl}${modelPath}}`
                );
            console.log(response);
            return response['_id'];
        });
}

function uploadExistingModel(model, formular){
    let serialModel = prepareModel(model, formular);
    return fetch(`${baseUrl}${modelPath}/${model['#modelID']}`, {
        method: 'POST',
        body: serialModel,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok)
            return response.json();
        else 
            sendErrorReport(
                `Verbindung zur Datenbank ist Fehlgeschlagen mit status ${response.status} und folgender Meldung: ${response.statusText}.`,
                JSON.stringify(formular),
                JSON.stringify(model),
                `URL: ${baseUrl}${modelPath}/${model['#modelID']}`
            );
        // throw new Error(`Verbindung zur Datenbank ist Fehlgeschlagen mit status ${response.status} und folgender Meldung: ${response.statusText}.`);
    }).then(response => {
        if (Object.keys(response).length !== 0)
            sendErrorReport(
                "Speichern des Models ist aus einem unbekannten Grund fehlgeschlagen. Für mehr Informationen mit 'r.seidler' in Verbindung setzen.",
                JSON.stringify(formular),
                JSON.stringify(model),
                `URL: ${baseUrl}${modelPath}/${model['#modelID']}`
            );
        // throw new Error("Speichern des Models ist aus einem unbekannten Grund fehlgeschlagen. Für mehr Informationen mit 'r.seidler' in Verbindung setzen.")
        console.log(response)
    })
}

function removeExistingModel(model, formular){
    let modelId = model['#modelID'];
    return fetch(`${baseUrl}${modelPath}/${modelId}`, {method: 'DELETE'})
        .then(response => {
            if (response.ok)
                return;
            else
                sendErrorReport(
                    `Beim Löschen des models hat die Datenbank einen Fehlercode zurückgegeben. Fehlercode: ${response.status}; Fehlernachricht: ${response.statusText}`,
                    JSON.stringify(formular),
                    JSON.stringify(model),
                    `URL: ${baseUrl}${modelPath}/${modelId}`
                );
        })
}

function loadModelFromDB(modelId, formular){
    return fetch(`${baseUrl}${modelPath}/${modelId}`)
        .then(response => {
            if (response.ok)
                return response.json();
            else
                sendErrorReport(
                    `Beim Laden des models hat die Datenbank einen Fehlercode zurückgegeben. Fehlercode: ${response.status}; Fehlernachricht: ${response.statusText}`,
                    JSON.stringify(formular),
                    "",
                    `URL: ${baseUrl}${modelPath}/${modelId}`
                );
                // throw new Error(`Beim laden des models hat die Datenbank einen Fehlercode zurückgegeben. Fehlercode: ${response.status}; Fehlernachricht: ${response.statusText}`);
        })
        .then(data => {
            console.log({model: data}); 
            data['#modelID'] = modelId;
            return data
        })
}

function loadSchemaFromDB(schemaId){
    if (schemaId == undefined) 
        createCustomAlert("Es ist kein Schema angegeben. In der URL muss der Parameter 'schema' mit einer gültigen schema ID angegeben sein (zB.: http://wiki.protronic-gmbh.de:8087/form-gen/prot-form-gen.html?schema=1012).");
    else
        return fetch(`${baseUrl}${schemaPath}/${schemaId}`) 
    .then(response => {
        if (response.ok || response.status == 500)  // status 500 wird im nächsten schritt behandelt
            return response.json();
        else 
            sendErrorReport(
                `Datenbank Anfrage gab Fehlercode ${response.status}, mit folgender Nachricht zurück: "${response.statusText}".`,
                "",
                "",
                `URL: ${baseUrl}${schemaPath}/${schemaId}`
            );
            // throw new Error(`Datenbank Anfrage gab Fehlercode ${response.status}, mit folgender Nachricht zurück: "${response.statusText}".`);
    })
    .then(response => {
        if (response.error != undefined ) 
            sendErrorReport(
                `Schema #${schemaId} konnte in der Datenbank nicht gefunden werden.`,
                "",
                "",
                `URL: ${baseUrl}${schemaPath}/${schemaId}`
            );
            // throw new Error(`Schema #${schemaId} konnte in der Datenbank nicht gefunden werden.`);
        else
            return response;
    })
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
                // console.log(schema)
                this.applySchema(schema);
            })
            .catch(err => {
                createCustomAlert(err.message);
            })
    }

    applySchema(schema){
        console.log({schema: schema})
        this.schema = schema;
        this.options.name = schema.formular;
        this.options.label = `${schema.formular}`;
        this.options.subform = schema.felder;

        try{
            let modelId = this.modelId = (new SearchParams(location.search)).get('mid');

            if(modelId){
                loadModelFromDB(modelId, schema.formular)
                    .then(model => {
                        this.model = this.convertValue('initialModel', JSON.stringify(model));
                        this.model['#modelID'] = modelId;
                        this.options.name = schema.formular;
                        this.options.label = `${this.options.label} ${modelId}`;
                        this.options.initialModel = this.convertValue('initialModel', JSON.stringify(model));
                        this.rootElement.options = this.options;
                        this.applyTemplate();
                    })
                    .catch(err => createCustomAlert(err.message, "Fehler"));    
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
        this.copyModelButton();
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

    createNewFormURL(modelId){
        let uri = new URL(location.href);
        let search = (new SearchParams(location.search));
        search.set('lsid', 'null');
        search.delete('mid');
        if (modelId !== undefined) {
            search.set('mid', modelId);
            location.search = search;
        } else {
            uri.search = search.toString();
            location.search = search;
        }
        return uri.href;
    }

    newFormularButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', () => {
            this.createNewFormURL();
            this.remove();
            document.body.append(document.createElement('prot-form-gen'));
        });
        btn.innerText = 'Neu Anlegen';
        this.appendChild(btn);
    }

    newRemoveButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', () => {
            if (this.model['#modelID'] && confirm(`Are you sure, you want to renove model with id: ${this.model['#modelID']}?`)){
                removeExistingModel(this.model, this.schema.formular)
                    .then(() => {
                        this.createNewFormURL();
                        this.remove();
                        document.body.append(document.createElement('prot-form-gen'));
                    })
                    .catch(err => createCustomAlert(err.message, "Fehler"));
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
                            .then(() => createCustomAlert(`Änderungen an ${this.model['#modelID']} wurden gespeichert.`, "Erfolg"))
                            .catch(err => createCustomAlert(err.message, "Fehler"))
                    } else {
                        uploadNewModel(this.model, this.schema.formular)
                            .then(modelId => {
                                this.model['#modelID'] = modelId;
                                this.createNewFormURL(modelId);
                                this.querySelector(`label[for="${this.schema.formular}"]`).innerText = `${this.options.label} ${modelId}`;
                                createCustomAlert(`Daten wurden erfolgreich in der Datenbank unter folgender ID abgelegt.\n${modelId}`, "Erfolg");
                            })
                            .catch(err => createCustomAlert(err.message, "Fehler"));
                    }    
                }                
            } else {
                console.log('invalid')
            }
        });
        btn.innerText = 'Speichern';
        this.appendChild(btn);
    }

    copyModelButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', this.copyModelButtonClickListener.bind(this, this));
        btn.innerText = 'Model kopieren';
        this.appendChild(btn);
    }

    copyModelButtonClickListener(self, event){
        self.remove();
            self.model['#modelID'] = undefined;
            uploadNewModel(self.model, self.schema.formular)
                .then(modelId => {
                    self.model['#modelID'] = modelId;
                    self.createNewFormURL(modelId);
                    document.body.append(document.createElement('prot-form-gen'));
                })
                .catch(err => createCustomAlert(err.message, "Fehler"));
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

customElements.define('prot-form-gen', FormCreator);