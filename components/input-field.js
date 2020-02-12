class InputField extends HTMLElement{
    template = '';
    defaultProps = {
        name: undefined,
        label: '',
        beschreibung: '',
        platzhalter: '',
        deaktiviert: false,
        muster: '.*',
        standard: '',
        pflichtfeld: false,
    };

    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = this.template;
    }

    verifyInput(){
        return true;
    }

    static test(value){
        return Boolean(value);
    }
}

