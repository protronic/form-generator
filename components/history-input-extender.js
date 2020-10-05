function generateRandomString(){
    let length = Math.floor(Math.random() * 10) + 1;
    return [...(new Array(length))].map(() => String.fromCharCode(Math.floor((Math.random() * 26) + 97))).join('');
}

function removeDuplicates(list){
    let result = [];
    list.forEach(entry => {
        if(!result.includes(entry)){
            result.push(entry);
        }
    })
    return result;
}


class HistoryInputExtender extends HTMLElement {
    constructor(){
        super();
    }

    connectedCallback(){
        this.historySource = this.getAttribute('history-source') || 'local'; // one of ['local', 'global']
        this.historyInputSelector = this.getAttribute('history-input-selector') || 'input'; // selector to get the input element referenced
        this.historyInputResultAttr = this.getAttribute('history-input-result-attr') || 'value';
        this.elements = {
            root: document.querySelector('prot-form-gen') || {schema: {formular: 'test_form'}, modelId: 100},
            in: this.parentElement.querySelector(this.historyInputSelector),
            ul: undefined,
            li: [],
        };
        this.storageName = `${this.elements.root.schema.formular}.${this.elements.root.modelId}.${this.elements.in.id}`;
        this.markedItem = -1;
        if(!this.historyInputResultAttr in this.elements.in){
            throw new Error(`Referenced ELement has no ${this.historyInputResultAttr} attribute;`);
        };
        this.obtainHistorySource();
    }

    obtainHistorySource(){
        if(this.historySource === 'local'){
            this.history = this.filteredHistory = JSON.parse(localStorage.getItem(this.storageName) || '[]');
            // this.history = this.filteredHistory = [...(new Array(20))].map(() => generateRandomString());
            this.createHistory();
        } else if (this.historySource === 'global'){
            window.addEventListener('message', this.onMessageSourceListener.bind(this, this.createHistory));
        }
    }

    createHistory(){
        this.createDropdown();
        this.setupListeners();
    }

    applyFilter(){
        this.filteredHistory = this.history.filter(value => Boolean(value)).filter(value => value.toLowerCase().startsWith(this.elements.in[this.historyInputResultAttr].toLowerCase()));
        this.createListElements();
    }

    createDropdown(){
        this.isVisible = false;
        this.className = 'history hidden';
        this.elements.ul = document.createElement('ul');
        this.createListElements();
        this.append(this.elements.ul);
    }

    showDropdown(){
        this.classList.remove('hidden');
        this.isVisible = true;
    }

    hideDropdown(){
        this.classList.add('hidden');
        let markedLiElement = document.querySelector('li.marked');
        if (markedLiElement) markedLiElement.classList.remove('marked');
        this.markedItem = -1;
        this.isVisible = false;
    }

    createListElements(premarked){
        this.elements.li = [];
        this.elements.ul.innerHTML = "";
        this.markedItem = this.markedItem > -1 ? (premarked || 0) : -1;
        this.filteredHistory.forEach((entry, index) => {
            let liElement = document.createElement('li');
            this.elements.li.push(liElement);
            if(index === this.markedItem) liElement.classList.add('marked');
            liElement.innerText = entry;
            this.elements.ul.append(liElement);
        });
    }

    moveMarkedItem(fromIndex, direction /* either 1 or -1 */){
        if(fromIndex !== -1) this.elements.li[fromIndex].classList.remove('marked');
        if(fromIndex === -1) {
            this.markedItem = (direction === -1) ? (this.filteredHistory.length - 1) : 0;
        }
        else if (this.filteredHistory.length === 1) {
            this.markedItem = fromIndex === 0 ? -1 : 0;
        }
        else if (fromIndex === 0) {
            this.markedItem = (direction === -1) ? -1 : (fromIndex + direction);
        }
        else if (fromIndex === (this.filteredHistory.length - 1)) {
            this.markedItem = (direction === -1) ? (fromIndex + direction) : -1;
        }
        else {
            this.markedItem = fromIndex + direction;
        }
        if(this.markedItem !== -1) {
            this.elements.li[this.markedItem].classList.add('marked');
            this.elements.ul.scrollTo(0, this.elements.li[this.markedItem].offsetTop);
            // this.elements.li[this.markedItem].scrollIntoView(false);
        }
        
    }

    onClickListener(event){
        if(event.target.nodeName === 'LI'){
            event.preventDefault();
            this.elements.in[this.historyInputResultAttr] = event.target.innerText;
            this.hideDropdown();
        }
    }

    onFocusListener(event){
        this.applyFilter();
        if(this.filteredHistory.length > 0){
            this.showDropdown();
        }
    }

    onBlurListener(event){
        this.hideDropdown();
    }

    onMouseDownListener(event){
        event.preventDefault();
    }

    onKeyListener(event){
        if(event.which == 13){
            if(this.markedItem !== -1) {
                this.elements.in[this.historyInputResultAttr] = this.filteredHistory[this.markedItem];
                this.hideDropdown();
            }
        }
        if(event.which == 27){
            if(this.isVisible){
                this.hideDropdown();
                event.preventDefault();
            }
        }
        if(event.which == 38 && (this.filteredHistory.length > 0)){
            this.moveMarkedItem(this.markedItem, -1);
            this.showDropdown();
            event.preventDefault();
        }
        if(event.which == 40 && (this.filteredHistory.length > 0)){
            this.moveMarkedItem(this.markedItem, 1);
            this.showDropdown();
            event.preventDefault();
        }
        if(!event.ctrlKey && event.which == 46 && this.historySource === 'local'){
            if(this.markedItem !== -1){
                this.removeValue(this.filteredHistory[this.markedItem]);
                if(this.history.length === 0) {
                    this.hideDropdown();
                }
                event.preventDefault();
            }
        }
    }

    onInputListener(event){
        this.applyFilter();
    }

    onMessageListener(event){
        let msg = JSON.parse(event.data);
        if(msg.messageType === 'submit-msg' && this.historySource === 'local'){
            this.recordValue(msg.messageData[this.elements.in.id])
        } else if (msg.messageType === 'clear-storage' && this.historySource === 'local'){
            if(msg.messageData[this.elements.in.id]){
                localStorage.setItem(this.storageName, '[]');
            }
        }
    }

    onMessageSourceListener(callback, event){
        let msg = JSON.parse(event.data);
        if (msg.messageType === 'history-source-models'){
            // should contain an Array of models for messageData
            this.history = this.filteredHistory = removeDuplicates(msg.messageData.map(model => model[this.elements.in.id]));
            callback.bind(this)();
        }
    }

    setupListeners(){
        this.elements.ul.addEventListener('click', this.onClickListener.bind(this));
        this.elements.ul.addEventListener('mousedown', this.onMouseDownListener.bind(this));
        this.elements.in.addEventListener('focus', this.onFocusListener.bind(this));
        this.elements.in.addEventListener('blur', this.onBlurListener.bind(this));
        this.elements.in.addEventListener('keydown', this.onKeyListener.bind(this));
        this.elements.in.addEventListener('input', this.onInputListener.bind(this));
        window.addEventListener('message', this.onMessageListener.bind(this));
    }

    recordValue(value){
        console.log({operation: 'record', element: this.elements.in.id, value: value});
        if(!Boolean(value)) return;
        let index = this.history.findIndex((entry) => (value.toLowerCase() === entry.toLowerCase()));
        if (index === -1){
            this.history.push(value);
        } 
        localStorage.setItem(this.storageName, JSON.stringify(this.history));
    }

    removeValue(value){
        console.log({operation: 'remove', element: this.elements.in.id, value: value});
        this.history = this.history.filter(entry => (entry.toLowerCase() !== value.toLowerCase()));
        this.filteredHistory = this.history.filter(value => Boolean(value)).filter(value => value.toLowerCase().startsWith(this.elements.in[this.historyInputResultAttr].toLowerCase()));
        if(this.markedItem === this.filteredHistory.length) this.markedItem -= 1;
        localStorage.setItem(this.storageName, JSON.stringify(this.history));
        this.createListElements(this.markedItem);        
    }
}

customElements.define('history-input-extender', HistoryInputExtender);
