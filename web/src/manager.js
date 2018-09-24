export default function(store, genkeys) {
  return {
    registerKeys(identifier) {
      return new Promise((resolve, reject) => {
        genkeys.rid().then((rid) => {
          return store.setRegistrationId(rid).catch(reject);
        }).then(() => {
          genkeys.identityKey().then((identityKey) => {
            store.setIdentityKey(identityKey).catch(reject).then(() => {
              store.saveIdentity(identifier.toString(), identityKey.pubKey).then(() => {
                genkeys.preKey().then((preKey) => {
                  store.storePreKey(preKey.keyId, preKey.keyPair).then(() => {
                    genkeys.signedPreKey(identityKey, preKey.keyId).then((signedPreKey) => {
                      store.storeSignedPreKey(preKey.keyId, signedPreKey).then(resolve).catch(reject);
                    }).catch(reject);
                  }).catch(reject);
                }).catch(reject);
              }).catch(reject);
            }).catch(reject);
          }).catch(reject);
        });
      });
    }
  };
}
