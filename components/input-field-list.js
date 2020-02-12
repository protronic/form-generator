class InputFieldList extends InputField {
    items = [];

    template = `
    <span x-html="label"></span>
    <template x-for="item in $el.items"></template>
    `;
}