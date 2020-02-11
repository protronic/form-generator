class InputFieldBoolean extends InputField {
    template = `
        <div class="form-element">
            <input type="checkbox" x-bind:id="name" x-bind:checked="standard" x-bind:disabled="InputField.test(deaktiviert)">
            <label x-bind:for="name" x-html="label"></label>
            <span style="font-style: italic;" x-show="InputField.test(pflichtfeld)">Pflichtfeld</span>
        </div>
    `
    
    constructor(){
        super();
    }
}

customElements.define('input-field-boolean', InputFieldBoolean);