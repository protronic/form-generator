// module.exports.fieldTypeMap = {
//   'text': {
//       tag: 'input-field-text',
//       constr: InputFieldText,
//   },
//   'email': {
//       tag: 'input-field-email', 
//       constr: InputFieldEmail
//   },
//   'tel': {
//       tag: 'input-field-tel', 
//       constr: InputFieldTel
//   },
//   'date': {
//       tag: 'input-field-date', 
//       constr: InputFieldDate
//   },
//   'textarea': {
//       tag: 'input-field-textarea', 
//       constr: InputFieldTextarea
//   },
//   'boolean': {
//       tag: 'input-field-boolean', 
//       constr: InputFieldBoolean
//   },
//   'dropdown': {
//       tag: 'input-field-dropdown', 
//       constr: InputFieldDropdown
//   },
//   'radio': {
//       tag: 'input-field-radio', 
//       constr: InputFieldRadio
//   },
//   'lookup': {
//       tag: 'input-field-lookup', 
//       constr: InputFieldLookup
//   },
//   'dependenttext': {
//       tag: 'input-field-abhaengig', 
//       constr: InputFieldAbhaengig
//   },
//   'list': {
//       tag: 'input-field-list', 
//       constr: InputFieldList
//   },
//   'object': {
//       tag: 'input-field-object', 
//       constr: InputFieldObject
//   }
// }

const { InputFieldText, InputFieldEmail, InputFieldTel, InputFieldDate } = require('./input-field-generic.js');
const { InputFieldTextarea } = require('./input-field-textarea.js');
const { InputFieldBoolean } = require('./input-field-boolean.js');
const { InputFieldDropdown } = require('./input-field-dropdown.js');
const { InputFieldRadio } = require('./input-field-radio.js');
const { InputFieldLookup } = require('./input-field-lookup.js');
const { InputFieldAbhaengig } = require('./dependent-fields.js');
const { InputFieldList } = require('./input-field-list.js');
const { InputFieldObject } = require('./input-field-object.js');

const tagClassMap = {
  'input-field-text': InputFieldText,
  'input-field-email': InputFieldEmail,
  'input-field-tel': InputFieldTel,
  'input-field-date': InputFieldDate,
  'input-field-textarea': InputFieldTextarea,
  'input-field-boolean': InputFieldBoolean,
  'input-field-dropdown': InputFieldDropdown,
  'input-field-radio': InputFieldRadio,
  'input-field-lookup': InputFieldLookup,
  'input-field-abhaengig': InputFieldAbhaengig,
  'input-field-list': InputFieldList,
  'input-field-object': InputFieldObject, 
}

Object.keys(tagClassMap).forEach(keyTag => {
  customElements.define(keyTag, tagClassMap[keyTag]);
});