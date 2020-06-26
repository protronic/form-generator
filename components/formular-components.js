const { InputFieldText, InputFieldEnumListText, EnumListableMixin, InputFieldEmail, InputFieldTel, InputFieldDate, InputFieldNumber } = require('./input-field-generic.js');
const { InputFieldTextarea } = require('./input-field-textarea.js');
const { InputFieldBoolean } = require('./input-field-boolean.js');
const { InputFieldDropdown } = require('./input-field-dropdown.js');
const { InputFieldRadio } = require('./input-field-radio.js');
const { InputFieldLookup } = require('./input-field-lookup.js');
const { InputFieldAbhaengig, DependenceMixin } = require('./dependent-fields.js');
const { InputFieldList } = require('./input-field-list.js');
const { InputFieldObject } = require('./input-field-object.js');
const { InputFieldChooseList } = require('./input-field-choose-list.js');
const { InfoFieldSummary } = require('./info-field-summary.js');

const InputFieldDependentEnumTextarea = class extends EnumListableMixin(DependenceMixin(InputFieldTextarea)){
    constructor(){
        super();
    }
}

const InputFieldEnumTextArea = class extends EnumListableMixin(InputFieldTextarea){
    constructor(){
        super();
    }
}

const InputFieldDependentChooseList = class extends DependenceMixin(InputFieldChooseList){
    constructor(){
        super();
    }
}

const fieldTypeMap = module.exports.fieldTypeMap = {
    'text': {
        tag: 'input-field-text',
        conName: InputFieldText,
    },
    'enumtext': {
        tag: 'input-field-enumlisttext',
        conName: InputFieldEnumListText,
    },
    'enumtextarea': {
        tag: 'input-field-enumlisttextarea',
        conName: InputFieldEnumTextArea,
    },
    'dependentenumtextarea': {
        tag: 'input-field-dependentenumtextarea',
        conName: InputFieldDependentEnumTextarea,
    },
    'email': {
        tag: 'input-field-email',
        conName: InputFieldEmail,
    },
    'tel': {
        tag: 'input-field-tel',
        conName: InputFieldTel,
    },
    'date': {
        tag: 'input-field-date',
        conName: InputFieldDate,
    },
    'number': {
        tag: 'input-field-number',
        conName: InputFieldNumber,
    },
    'textarea': {
        tag: 'input-field-textarea',
        conName: InputFieldTextarea,
    },
    'boolean': {
        tag: 'input-field-boolean',
        conName: InputFieldBoolean,
    },
    'dropdown': {
        tag: 'input-field-dropdown',
        conName: InputFieldDropdown,
    },
    'radio': {
        tag: 'input-field-radio',
        conName: InputFieldRadio,
    },
    'lookup': {
        tag: 'input-field-lookup',
        conName: InputFieldLookup,
    },
    'dependenttext': {
        tag: 'input-field-abhaengig',
        conName: InputFieldAbhaengig,
    },
    'list': {
        tag: 'input-field-list',
        conName: InputFieldList,
    },
    'object': {
        tag: 'input-field-object',
        conName: InputFieldObject,
    },
    'choose': {
        tag: 'input-field-choose-list',
        conName: InputFieldChooseList,
    },
    'dependentchoose': {
        tag: 'input-field-dependent-choose-list',
        conName: InputFieldDependentChooseList,
    },
    'infosummary': {
        tag: 'info-field-summary',
        conName: InfoFieldSummary,
    }
};

// const tagClassMap = {
//     'input-field-text': InputFieldText,
//     'input-field-enumlisttext': InputFieldEnumListText,
//     'input-field-dependentenumtextarea': InputFieldDependentEnumTextarea,
//     'input-field-email': InputFieldEmail,
//     'input-field-tel': InputFieldTel,
//     'input-field-date': InputFieldDate,
//     'input-field-textarea': InputFieldTextarea,
//     'input-field-boolean': InputFieldBoolean,
//     'input-field-dropdown': InputFieldDropdown,
//     'input-field-radio': InputFieldRadio,
//     'input-field-lookup': InputFieldLookup,
//     'input-field-abhaengig': InputFieldAbhaengig,
//     'input-field-list': InputFieldList,
//     'input-field-object': InputFieldObject,
//   }
  