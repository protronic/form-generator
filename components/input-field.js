class InputField extends HTMLElement{
    template = '';

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

