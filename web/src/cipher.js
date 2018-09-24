import libsignal from 'libsignal';

export default function(store, genkeys) {
  return {
    encrypt(identifier, keys, plaintext) {
      return new Promise((resolve, reject) => {
        const address = new libsignal.SignalProtocolAddress(
          identifier.number,
          identifier.deviceId,
        );
        const builder = new libsignal.SessionBuilder(
          store,
          address,
        );

        console.log('encrypt');

        builder.processPreKey(keys).then(() => {
          const sessionCipher = new libsignal.SessionCipher(store, address);
          sessionCipher.encrypt(plaintext).then((ciphertext) => {
            resolve(ciphertext);
          }).catch(reject);
        }).catch(reject);
      });
    },
  };
}