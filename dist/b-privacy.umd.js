(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.bPrivacy = factory());
}(this, (function () { 'use strict';

class BPrivacy {
  constructor({isBrowser = true}) {
    this.isBrowser = isBrowser; // whether we're running in the browser or on a mobile environment (React-Native)
    this;
  }
}


var bPrivacy = BPrivacy;

return bPrivacy;

})));
