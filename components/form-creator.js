class FormCreator extends HTMLElement {
    defaultProps = {
        name: undefined,
        label: '',
        beschreibung: '',
        platzhalter: '',
        deaktiviert: false,
        muster: '.*',
        standard: '',
        pflichtfeld: false,
        items: [],
        subform: []
    }

    constructor(){
        super();
    }

    connectedCallback(){
        let schemaLink = this.getAttribute('schemalink');
        fetch(schemaLink)
            .then(response => response.json())
            .then(schema => {
                this.innerHTML = schema.felder.map(field => ((console.log(field.toSource().slice(1, -1))), `<${field.feldtyp} x-data='${({...this.defaultProps, ...field}).toSource().slice(1, -1)}'></${field.feldtyp}>`)).join('\n');        
            })
    }
}

customElements.define('form-creator', FormCreator);