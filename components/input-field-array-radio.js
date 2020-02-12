class InputFieldArrayRadio extends InputField {
    template = `
    <div class="form-element">
        <label x-bind:for="name" x-html="label"></label>
        <template x-for="item in items">
            <input type="radio" x-bind:value="item" x-bind:selected="item === standard" x-text="item">
        </template>
        <span style="font-style: italic;" x-show="InputField.test(pflichtfeld)">Pflichtfeld</span>
    </div>
    `;
}

customElements.define('input-field-array-radio', InputFieldArrayRadio)