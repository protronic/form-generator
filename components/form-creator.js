class FormCreator extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        let schemaLink = this.getAttribute('schemalink');
        fetch(schemaLink)
            .then(response => response.json())
            .then(schema => {
                this.schema = schema;
                this.renderSchema(schema.felder);
                this.testModelCreation();
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

    renderSchema(schemafelder){
        this.innerHTML = `
            <form class="form-element"> 
                ${schemafelder.map(schemaFeld => 
                    `<${schemaFeld.feldtyp} ${Object.keys(schemaFeld).map(key => 
                        `${key}='${this.saveValue(key, schemaFeld[key])}'`).join(' ')}></${schemaFeld.feldtyp}>`
                ).join('\n')}
            </form>
        `
    }

    testModelCreation(){
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (event) => {
            let model = {};
            this.querySelectorAll('form > *').forEach(element => {
                let partialModel = element.getModel()
                if(partialModel)
                    model[element.options.name] = partialModel
            });
            console.log(model)
            localStorage.setItem('last', JSON.stringify(model))
        });
        btn.innerText = 'teste model generierung';
        this.append(btn)
    }

    saveValue(key, value){
        // if(value) value = value;
        // console.log(JSON.stringify(value));
        if(key === 'query') value = value.split("'").join("&#39;");
        return JSON.stringify(value);
    }

    convertValue(key, value){
        return JSON.stringify(value);
    }
}

customElements.define('form-creator', FormCreator);