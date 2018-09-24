export default {
  equal(b1, b2) {
    if (!(b1 instanceof ArrayBuffer && b2 instanceof ArrayBuffer)) {
      return false;
    }
    if (b1.byteLength !== b2.byteLength) {
      return false;
    }
    let result = 0;
    const ta1 = new Uint8Array(b1);
    const ta2 = new Uint8Array(b2);
    for (let i = 0; i < b1.byteLength; i += 1) {
      // eslint-disable-next-line no-bitwise
      result |= ta1[i] ^ ta2[i];
    }
    return result === 0;
  },

  notEqual(b1, b2) {
    return !this.equal(b1, b2);
  },
};