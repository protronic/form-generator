class InputFieldDate extends InputField {
    template = `
        <div class="form-element">
            <label x-bind:for="name" x-html="label"></label>
            <input type="date" x-bind:id="name" x-bind:value="standard" x-bind:disabled="InputField.test(deaktiviert)">
            <span style="font-style: italic;" x-show="InputField.test(pflichtfeld)">Pflichtfeld</span>
        </div>
        `;
    
    constructor(){
        super();
    }
}

customElements.define('input-field-date', InputFieldDate);