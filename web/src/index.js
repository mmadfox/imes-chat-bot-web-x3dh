import libsignalStore from './libsignal-store';
import genkeys from './genkeys';
import manager from './manager';
import cipher from './cipher';

/*
imeskeys({}).then((ik) => {
  ik.saveIdentityKey();
  ik.savePreKey();
  ik.saveSignedPreKey();
  ik.encrypt(identifier, device, message);
  ik.decrypt(identifier, device, message);
}).catch(err => conosle.log(err));
*/

module.exports = function open(config) {
  return new Promise((resolve, reject) => {
    const store = libsignalStore.create('imeskeys-dev');
    store.on('connect', () => {
      const m = manager(store, genkeys);
      const c = cipher(store, genkeys);
      resolve({
        create: genkeys,
        encrypt: c.encrypt,
        register: m.registerKeys
      });
    });
    store.on('error', reject);
    store.open();
  });
};
