class InputFieldArrayDropdown extends InputField {
    template = `
    <div class="form-element">
        <label x-bind:for="name" x-html="label"></label>
        <select x-bind:id="name" x-bind:disabled="InputField.test(deaktiviert)">
            <template x-for="item in items">
                <option x-bind:value="item" x-bind:selected="item === standard" x-text="item"></option>
            </template>
        </select>
        <span style="font-style: italic;" x-show="InputField.test(pflichtfeld)">Pflichtfeld</span>
    </div>
    `;
}

customElements.define('input-field-array-dropdown', InputFieldArrayDropdown)