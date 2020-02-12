class InputFieldObject extends InputField {
    subform = [];
    template = `
    <div class="form-element" x-init="console.log($el), $el.subform=subform">
        <span x-text="label"></span>
        <div class="form-group"></div>
    </div>
    `;

    buildForm(fieldList){
        return fieldList.map(field => `<${field.feldtyp}></${field.feldtyp}>`)
    }

    connectedCallback(){
        super.connectedCallback();

        setTimeout(() => {
            console.log(this.subform)
            this.querySelector('div.form-group').innerHTML = this.buildForm(this.subform);
        }, 1000)
    }
}

customElements.define('input-field-object', InputFieldObject);