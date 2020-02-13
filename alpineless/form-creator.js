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
                
            })
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

    saveValue(key, value){
        // console.log(JSON.stringify(value));
        // console.log(encodeURI(value));
        return JSON.stringify(value);
    }

    convertValue(key, value){
        return JSON.stringify(value);
    }
}

customElements.define('form-creator', FormCreator);