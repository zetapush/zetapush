const aesjs = require('aes-js');

class Base64 {
  static decode(encoded) {
    return Buffer.from(encoded, 'base64').toString();
  }
  static encode(decoded) {
    return Buffer.from(decoded).toString('base64');
  }
}

class Crypto {
  static get salt() {
    return 'JavaScriptRocks';
  }
  constructor(key) {
    const KEY_SIZE = 32;
    const DEFAULT_KEY = '1357986420AETUOLJFSWWCBNXVZRYIQD';
    key = key.padStart(KEY_SIZE, DEFAULT_KEY).substring(0, KEY_SIZE);
    key = [...key].map((char) => char.codePointAt(0));
    this.controller = () => new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  }
  encrypt(text) {
    // Convert text to bytes
    const bytes = aesjs.utils.utf8.toBytes(Crypto.salt + text);
    // The counter is optional, and if omitted will begin at 1
    const encrypted = this.controller().encrypt(bytes);
    // To print or store the binary data, you may convert it to hex
    return Base64.encode(aesjs.utils.hex.fromBytes(encrypted));
  }
  decrypt(encrypted) {
    // When ready to decrypt the hex string, convert it back to bytes
    const bytes = aesjs.utils.hex.toBytes(Base64.decode(encrypted));
    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    const decrypted = this.controller().decrypt(bytes);
    // Convert our bytes back into text
    const text = aesjs.utils.utf8.fromBytes(decrypted);
    return text.substring(Crypto.salt.length);
  }
}

module.exports = { Crypto };
