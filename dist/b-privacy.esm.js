class BPrivacy {
  constructor({isBrowser = true}) {
    this.isBrowser = isBrowser; // whether we're running in the browser or on a mobile environment (React-Native)
    this;
  }
}


module.exports = BPrivacy;
