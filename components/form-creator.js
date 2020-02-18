function prepareModel(model, formular){
    let user = '';
    let changedTime = (new Date()).getTime();

    try{
        user = wikiContext.UserName;
    } catch(err) {
        console.log('wikiContext not in scope.');
        console.error(err);
    }

    model['#parentForm'] = formular;
    model['#changed_user'] = user;
    model['#changed_time'] = changedTime;

    return JSON.stringify(JSON.stringify(model)).slice(1, -1);
}

function uploadModel(model, formular){
    let serialModel = prepareModel(model, formular);
    console.log(`{"q": "INSERT INTO model (log) VALUES ('${serialModel}');SELECT TOP 1 _id FROM model WHERE log = '${serialModel}' ORDER BY _id DESC;"}`)
    fetch('http://prot-subuntu:8081/formly', {
        method: 'POST',
        body: `{"q": "INSERT INTO model (log) VALUES ('${serialModel}');SELECT TOP 1 _id FROM model WHERE log = '${serialModel}' ORDER BY _id DESC;"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(dataRows => dataRows.recordset[0]._id)
}

class FormCreator extends InputFieldObject{
    constructor(){
        super();
    }

    connectedCallback(){
        let schemaLink = this.getAttribute('schemalink');
        
        this.rootElement = document.createElement('form');
        this.rootElement.classList.add('form-root');
        this.append(this.rootElement);


        fetch(schemaLink)
            .then(response => response.json())
            .then(schema => {
                this.schema = schema;
                this.options.name = this.options.label = schema.formular;
                this.options.subform = schema.felder;

                try{
                    this.options.initialModel = this.loadFromLocal();
                } catch(err) {
                    console.log(this.options.initialModel);
                    console.error(err);
                }

                this.rootElement.options = this.options;
                this.applyTemplate()

                this.testModelCreation();
                this.uploadModelButton();
                this.renderGeneralInfo(schema);
            })
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
                let model = this.getModel();
                console.log(model);
                this.saveFormLocal(undefined, model);

            } else {
                console.error('Einige Formular Elemente sind nicht korrekt ausgefüllt.');
            }
            
        });
        btn.innerText = 'Erzeuge Model';
        this.append(btn)
    }

    uploadModelButton(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            if(this.checkValidity()){
                let model = this.getModel();
                this.saveFormLocal(undefined, model);
                uploadModel(model, this.schema.formular)
                    .then(modelId => alert(`${modelId}`));
            }
        });
        btn.innerText = 'Upload Model';
        this.append(btn);
    }

    loadFromLocal(localStorageId){
        if(!localStorageId){
            let uri = new URL(location.href);
            localStorageId = uri.searchParams.get('lsid');
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

        if(lastSaves === null || lastSaves >= 10){
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