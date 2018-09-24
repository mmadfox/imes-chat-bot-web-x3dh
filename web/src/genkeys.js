const libsignal = require('libsignal');

const genkeys = {
  rid() {
    return Promise.resolve(libsignal.KeyHelper.generateRegistrationId());
  },

  identityKey() {
    return libsignal.KeyHelper.generateIdentityKeyPair();
  },

  keyId() {
    return Promise.resolve(new Date().valueOf());
  },

  preKey(keyId) {
    if (!keyId) {
      keyId = new Date().valueOf();
    }
    return libsignal.KeyHelper.generatePreKey(keyId);
  },

  signedPreKey(identityKey, keyId) {
    return libsignal.KeyHelper.generateSignedPreKey(identityKey, keyId);
  },

  profileKey() {
    return Promise.resolve(libsignal.crypto.getRandomBytes(32));
  }
};

export default genkeys;
