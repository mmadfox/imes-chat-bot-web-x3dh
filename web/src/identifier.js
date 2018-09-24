// +79817684256
// +79817684356.1
// +79817684356.2
export default class Identifier {
  static create(value) {
    if (value instanceof Identifier) {
      return value;
    }
    return new Identifier(value);
  }

  constructor(value) {
    if (value === undefined) {
      throw new Error('invalid identifier');
    }

    const parts = String(value).split('.');
    const number = parts[0];
    const deviceId = parseInt(parts[1], 10) || 1;

    this.id = value;
    this.number = number;
    this.devideId = deviceId || 1;
  }

  getNumber() {
    return this.number;
  }

  getDeviceId() {
    return this.devideId;
  }

  toString() {
    return this.id;
  }
}
