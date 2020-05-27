Object.defineProperty(String.prototype, 'includes', {
  enumerable: false, 
  value: function (str) {
    return this.indexOf(str) !== -1;
  }
});

Object.defineProperty(Array.prototype, 'includes', {
  enumerable: false, 
  value: function (elt) { 
    return this.indexOf(elt) !== -1; 
  }
});

Object.defineProperty(HTMLElement.prototype, 'remove', {
  enumerable: false,
  value: function() {
    if (this.parentNode) {
        this.parentNode.removeChild(this);
    }
  }
});

window.Promise = require("bluebird");
require('url-search-params-polyfill');
require('isomorphic-fetch');
require('@webcomponents/webcomponentsjs/webcomponents-bundle.js');

require('./form-creator.js');