import { Config } from '../common-types';

const aesjs = require('aes-js');

class Base64 {
  static decode(encoded: string) {
    return Buffer.from(encoded, 'base64').toString();
  }
  static encode(decoded: string) {
    return Buffer.from(decoded).toString('base64');
  }
}

export class Crypto {
  private controller: () => any;

  static get salt() {
    return 'JavaScriptRocks';
  }
  constructor(key: string) {
    const KEY_SIZE = 32;
    const DEFAULT_KEY = '1357986420AETUOLJFSWWCBNXVZRYIQD';
    key = key.padStart(KEY_SIZE, DEFAULT_KEY).substring(0, KEY_SIZE);
    const mappedKey = [...key].map((char) => char.codePointAt(0));
    this.controller = () => new aesjs.ModeOfOperation.ctr(mappedKey, new aesjs.Counter(5));
  }
  encrypt(text: string) {
    // Convert text to bytes
    const bytes = aesjs.utils.utf8.toBytes(Crypto.salt + text);
    // The counter is optional, and if omitted will begin at 1
    const encrypted = this.controller().encrypt(bytes);
    // To print or store the binary data, you may convert it to hex
    return Base64.encode(aesjs.utils.hex.fromBytes(encrypted));
  }
  decrypt(encrypted: string) {
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

export const decrypt = (config: Config): Config => {
  const { developerLogin, developerPassword, developerSecretToken, ...rest } = config;
  let decryted;
  if (developerPassword) {
    decryted = developerPassword;
  } else {
    if (developerLogin && developerSecretToken) {
      const crypto = new Crypto(developerLogin);
      decryted = crypto.decrypt(developerSecretToken);
    }
  }
  return {
    ...rest,
    developerLogin,
    developerPassword: decryted
  };
};

export const encrypt = (config: Config): Config => {
  const { developerLogin, developerPassword, ...rest } = config;
  let encryted;
  if (developerPassword && developerLogin) {
    const crypto = new Crypto(developerLogin);
    encryted = crypto.encrypt(developerPassword);
  }
  return {
    ...rest,
    developerLogin,
    developerSecretToken: encryted
  };
};
