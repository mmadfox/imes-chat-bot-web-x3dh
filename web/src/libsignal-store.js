import localforage from 'localforage';
import EventEmitter from 'events';
import Identifier from './identifier';
import bytes from './bytes';

// by order:
// 1. if exists localforage.INDEXEDDB then
// 2. if exists localforage.WEBSQL then
// 3. if exists localforage.LOCALSTORAGE
const drivers = [
  localforage.INDEXEDDB,
  localforage.WEBSQL,
  localforage.LOCALSTORAGE,
];

class Collection {
  constructor(dbname, collectionName) {
    this.db = localforage.createInstance({
      driver: drivers,
      name: dbname,
      storeName: collectionName,
    });
  }

  ready() {
    return this.db.ready();
  }

  drop() {
    this.db.dropInstance();
  }

  put(key, value) {
    return new Promise((resolve, reject) => {
      if (key === undefined || value === undefined || key === null || value === null) {
        reject(new Error('Tried to store undefined/null'));
      } else {
        this.db.setItem(key, value).then(resolve).catch(reject);
      }
    });
  }

  get(key, defaultValue) {
    return new Promise((resolve, reject) => {
      if (key === null || key === undefined) {
        reject(new Error('Tried to get value for undefined/null key'));
      } else {
        this.db.getItem(key).then((value) => {
          let result = defaultValue;
          if (value) {
            result = value;
          }
          resolve(result);
        }).catch(reject);
      }
    });
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      if (key === null || key === undefined) {
        reject(new Error('Tried to remove value for undefined/null key'));
      } else {
        this.db.removeItem(key).then(resolve).catch(reject);
      }
    });
  }
}

export default class SignalStore extends EventEmitter {
  static create(dbname) {
    return new SignalStore(dbname);
  }

  constructor(dbname) {
    super();

    this.defaultCollection = new Collection(dbname, 'default');
    this.identityKeyCollection = new Collection(dbname, 'identityKey');
    this.accountCollection = new Collection(dbname, 'account');
    this.sessionCollection = new Collection(dbname, 'session');
    this.preKeysCollection = new Collection(dbname, 'preKeys');
    this.signedPreKeyCollection = new Collection(dbname, 'signedPreKey');

    this.Direction = {
      SENDING: 1,
      RECEIVING: 2,
    };
  }

  open() {
    Promise.all([
      this.defaultCollection.ready(),
      this.identityKeyCollection.ready(),
      this.accountCollection.ready(),
      this.sessionCollection.ready(),
      this.preKeysCollection.ready(),
      this.signedPreKeyCollection.ready(),
    ]).then(() => {
      this.emit('connect');
    }).catch((err) => {
      this.emit('error', err);
    });
  }

  drop() {
    return Promise.all([
      this.defaultCollection.drop(),
      this.identityKeyCollection.drop(),
      this.accountCollection.drop(),
      this.sessionCollection.drop(),
      this.preKeysCollection.drop(),
      this.signedPreKeyCollection.drop()
    ]);
  }

  getIdentityKeyPair() {
    console.log('getIdentityKeyPair');

    return new Promise((resolve, reject) => {
      this.accountCollection.get('identityKey').then((key) => {
        console.log('>>', key);
        resolve(key);
      }).catch(reject);
    });
  }

  getLocalRegistrationId() {
    return this.accountCollection.get('registrationId');
  }

  setRegistrationId(registrationId) {
    return this.accountCollection.put('registrationId', registrationId);
  }

  setIdentityKey(key) {
    return this.accountCollection.put('identityKey', key);
  }

  loadPreKey(keyId) {
    return new Promise((resolve, reject) => {
      this.preKeysCollection.get(keyId).then((preKey) => {
        resolve({
          keys: preKey,
          isSet: preKey !== undefined,
        });
      }).catch(reject);
    });
  }

  storePreKey(keyId, key) {
    return this.preKeysCollection.put(keyId, key);
  }

  removePreKey(keyId) {
    return this.preKeysCollection.remove(keyId);
  }

  clearPreKeyStore() {
    return this.preKeysCollection.drop();
  }

  loadSignedPreKey(keyId) {
    return this.signedPreKeyCollection.get(keyId);
  }

  loadSignedPreKeys() {
    return new Promise((resolve, reject) => {
      const keys = [];
      this.signedPreKeyCollection.iterate((key) => {
        keys.push(key);
      }).then(() => {
        resolve(keys);
      }).catch(reject);
    });
  }

  storeSignedPreKey(keyId, key, confirmed) {
    return this.signedPreKeyCollection.put(keyId, {
      pubKey: key.keyPair.pubKey,
      privKey: key.keyPair.privKey,
      createdAt: Date.now(),
      confirmed: Boolean(confirmed)
    });
  }

  removeSignedPreKey(keyId) {
    return this.signedPreKeyCollection.remove(keyId);
  }

  clearSignedPreKeysStore() {
    return this.signedPreKeyCollection.drop();
  }

  loadSession(identifier) {
    if (identifier === null || identifier === undefined) {
      throw new Error('Tried to get session for undefined/null number');
    }
    return this.sessionCollection.get(identifier.toString());
  }

  // TODO
  isTrustedIdentity(identifier, publicKey, direction) {
    return new Promise((resolve, reject) => {
      resolve(true);
      /*if (identifier === null || identifier === undefined) {
        reject(new Error('Tried to get identity key for undefined/null key'));
      } else {
        // const id = Identifier.create(identifier);
        this.getIdentityKeyPair().then((key) => {
          return true;
        }).catch(reject);
      }*/
    });
  }

  storeSession(identifier, recordSession) {
    return new Promise((resolve, reject) => {
      if (identifier === null || identifier === undefined) {
        reject(new Error('Tried to put session for undefined/null number'));
      } else {
        const id = Identifier.create(identifier);
        this.sessionCollection.put(id.toString(), {
          deviceId: id.getDeviceId(),
          number: id.getNumber(),
          record: recordSession
        }).then(resolve).catch(reject);
      }
    });
  }

  loadIdentityKey(identifier) {
    return new Promise((resolve, reject) => {
      if (identifier === null || identifier === undefined) {
        reject(new Error('Tried to get identity key for undefined/null key'));
      } else {
        const id = Identifier.create(identifier);
        this.identityKeyCollection.get(id.getNumber()).then((identityKey) => {
          const pubKey = identityKey ? identityKey.publicKey : null;
          resolve({
            keys: pubKey,
            isSet: pubKey !== null
          });
        }).catch(reject);
      }
    });
  }

  saveIdentity(identifier, pubKey) {
    return new Promise((resolve, reject) => {
      if (identifier === null || identifier === undefined) {
        reject(new Error('Tried to put identity key for undefined/null key'));
      } else {
        const id = Identifier.create(identifier);
        const payload = {
          publicKey: pubKey,
          firstUse: true,
          timestamp: Date.now()
        };

        this.loadIdentityKey(identifier).then((identityKey) => {
          // save first identityKey
          if (!identityKey.isSet) {
            this.identityKeyCollection.put(id.number, payload).then(() => {
              resolve(true);
            }).catch(reject);
          } else if (bytes.notEqual(identityKey.keys.publicKey, pubKey)) {
            payload.firstUse = false;
            this.identityKeyCollection.put(id.number, payload).then(() => {
              this.emit('change', {
                what: 'identityKey',
                number: id.number
              });
            }).catch(reject);
          }
        });
      }
    });
  }

  put(key, value) {
    return this.defaultCollection.put(key, value);
  }

  get(key, defaultValue) {
    return this.defaultCollection.get(key);
  }

  remove(key) {
    return this.defaultCollection.remove(key);
  }
}