class InputFieldString extends InputField {
    template = `
        <div class="form-element">
            <label x-bind:for="name" x-html="label"></label>
            <input type="text" x-bind:id="name" x-bind:placeholder="platzhalter" x-bind:value="standard" x-bind:pattern="muster" x-bind:disabled="InputField.test(deaktiviert)">
            <span style="font-style: italic;" x-show="InputField.test(pflichtfeld)">Pflichtfeld</span>
        </div>
        `;
}

customElements.define('input-field-string', InputFieldString);